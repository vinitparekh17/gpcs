import { Server } from 'node:http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { getCookieToken } from '../../middlewares/socket.middleware.ts';
import { StreamSaver } from '../../utils/StreamSaver.ts';
import { JwtHelper, Logger } from '../../utils/index.ts';
import { speechClient } from '../gcp/speech.ts';
import { AiResponder } from '../../utils/AiResponder.ts';
import { pollyClient, pollyCommand } from '../aws/polly.ts';
import redis from '../../db/redis/index.ts';
import type { RequestAudio } from '../../types/index.ts';
import { SocketEvents } from '../../types/Stream.ts';

export class SocketServer {
	static io: SocketIOServer;
	private socket: Socket | undefined;
	private cacheKey: string | undefined;
	private toUser: string | undefined;
	protected completeResponse: string | undefined;
	constructor(server: Server) {
		SocketServer.io = new SocketIOServer(server, {
			cors: {
				origin: [
					'https://omnisive.technetic.co.in',
					'http://localhost:*',
				],
				maxAge: 86400,
				credentials: true,
			},
		});
		this.setupSocket();
	}

	private setupSocket() {
		const { io } = SocketServer;
		io.on(SocketEvents.CONNECT, async (socket: Socket) => {
			this.socket = socket;
			Logger.debug(`Client ${socket.id} connected`);

			const token = getCookieToken(socket);
			if (!token) {
				throw new Error('Unauthorized');
			}
			this.cacheKey = JwtHelper.getUserIdFromToken(token);

			const user = await redis.get(this.cacheKey);
			this.toUser = user !== null ? user : undefined;

			socket.on(
				SocketEvents.REQUEST_TEXT_STREAM,
				async (prompt: string) => {
					Logger.debug(prompt);
					await this.emitTextResponse(prompt);
				},
			);

			socket.on(
				SocketEvents.REQUEST_AUDIO_STREAM,
				async (data: RequestAudio) => {
					await this.EmitAudioResponse(data);
				},
			);

			socket.on('error', (error) => {
				throw error;
			});

			socket.on(SocketEvents.DISCONNECT, () => {
				this.toUser = undefined;
				this.completeResponse = '';
				if (this.socket) {
					const token = getCookieToken(this.socket);
					if (!token) {
						throw new Error('Unauthorized');
					}
					this.cacheKey = JwtHelper.getUserIdFromToken(token);
					redis.del(this.cacheKey);
					this.cacheKey = '';
				}
			});
		});
	}
	private safeEmit(event: string, data: object) {
		if (this.toUser) {
			SocketServer.io.to(this.toUser).emit(event, data);
		}
	}

	private async emitResponse(
		prompt: string,
		responseCallback: (
			response: string,
			isCompleted: boolean,
			err?: Error | null,
		) => void,
	) {
		if (!this.toUser) return;

		try {
			await AiResponder(
				prompt,
				async (
					response: string | null,
					isCompleted: boolean,
					err: Error | null,
				) => {
					if (err) {
						Logger.error(err.message);
						return;
					}

					if (!response) {
						return this.safeEmit(
							SocketEvents.RESPONSE_TEXT_STREAM,
							{
								response: `Unable to respond to: ${prompt}`,
								isCompleted: true,
							},
						);
					}
					await responseCallback(response, isCompleted, err);
				},
			);
		} catch (error) {
			Logger.error(error);
		}
	}

	private async emitTextResponse(prompt: string): Promise<void> {
		await this.emitResponse(prompt, (response, isCompleted) => {
			if (isCompleted) {
				this.safeEmit(SocketEvents.RESPONSE_TEXT_STREAM, {
					response: null,
					isCompleted,
				});

				if (this.cacheKey) {
					StreamSaver.saveStream(this.cacheKey, prompt, response);
				}
			} else {
				if (response && response !== '' && response !== 'SAFETY') {
					this.safeEmit(SocketEvents.RESPONSE_TEXT_STREAM, {
						response,
						isCompleted,
					});
				} else {
					this.safeEmit(SocketEvents.RESPONSE_TEXT_STREAM, {
						response: `I'm sorry, I cannot respond to that`,
						isCompleted: true,
					});
				}
			}
		});
	}

	private async EmitAudioResponse(data: RequestAudio) {
		try {
			const [response] = await speechClient.recognize({
				config: {
					encoding: 'LINEAR16',
					sampleRateHertz: data.sampleRateHertz || 16000,
					languageCode: 'en-US',
				},
				audio: {
					content: new Uint8Array(data.audio),
				},
			});

			if (!response.results) {
				return;
			}
			const prompt = response.results
				.map((result) => result.alternatives?.[0]?.transcript || '')
				.filter(Boolean)
				.join('\n');

			if (!prompt) {
				this.safeEmit(SocketEvents.REQUEST_PROMPT_TEXT, {
					prompt: 'No speech detected',
				});
				return;
			}

			this.safeEmit(SocketEvents.REQUEST_PROMPT_TEXT, { prompt });

			await this.processAiResponse(prompt);
		} catch (error: unknown) {
			Logger.error('Error in EmitAudioResponse:', error);
			this.safeEmit(SocketEvents.RESPONSE_TEXT_STREAM, {
				response: 'An error occurred during audio processing',
				isCompleted: true,
			});
		}
	}

	private async processAiResponse(prompt: string): Promise<void> {
		await AiResponder(
			prompt,
			async (
				response: string | null,
				isCompleted: boolean,
				err?: Error | null,
			) => {
				if (err) {
					Logger.error(err);
					return;
				}

				if (isCompleted) {
					// Final response handling
					this.safeEmit(SocketEvents.RESPONSE_TEXT_STREAM, {
						response: null,
						isCompleted,
					});

					if (!response) {
						return this.safeEmit(
							SocketEvents.RESPONSE_TEXT_STREAM,
							{
								response: `Unable to respond to: ${prompt}`,
								isCompleted: true,
							},
						);
					}
					await this.generateAndEmitAudioStream(prompt, response);
				} else {
					// Streaming response handling
					if (!response) {
						return this.safeEmit(
							SocketEvents.RESPONSE_TEXT_STREAM,
							{
								response: `Unable to respond to: ${prompt}`,
								isCompleted: true,
							},
						);
					}
					this.handleStreamingResponse(response, isCompleted);
				}
			},
		);
	}

	private async generateAndEmitAudioStream(
		prompt: string,
		response: string,
	): Promise<void> {
		try {
			const pollyResponse = await pollyClient.send(
				pollyCommand(response),
			);

			const audioStream = pollyResponse?.AudioStream
				? await pollyResponse.AudioStream.transformToByteArray()
				: new Uint8Array();

			this.safeEmit(SocketEvents.RESPONSE_AUDIO_STREAM, { audioStream });

			// Cache stream if needed
			if (this.cacheKey) {
				StreamSaver.saveStream(this.cacheKey, prompt, response);
			}
		} catch (error) {
			Logger.error('Error generating audio stream:', error);
		}
	}

	private handleStreamingResponse(
		response: string,
		isCompleted: boolean,
	): void {
		if (response && response !== '' && response !== 'SAFETY') {
			this.safeEmit(SocketEvents.RESPONSE_TEXT_STREAM, {
				response,
				isCompleted,
			});
		} else {
			this.safeEmit(SocketEvents.RESPONSE_TEXT_STREAM, {
				response: `I'm sorry, I cannot respond to that`,
				isCompleted: true,
			});
		}
	}
}
