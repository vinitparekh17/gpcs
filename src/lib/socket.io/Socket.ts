import { Server } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { getCookieToken } from '../../middlewares/socket.middleware';
import { StreamSaver } from '../../utils/StreamSaver';
import { JwtHelper, Logger } from '../../utils';
import { speechClient } from '../gcp/speech';
import { AiResponder } from '../../utils/AiResponder';
import { pollyClient, pollyCommand } from '../aws/polly';
import redis from '../../db/redis';
import { SocketEvents, RequestAudio } from '../../interface';

export class SocketServer {
    static io: SocketIOServer;
    private socket: Socket;
    private cacheKey: string;
    private toUser: string;
    protected completeResponse: string;
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

            this.cacheKey = JwtHelper.getUserIdFromToken(
                getCookieToken(socket)
            );

            // Get socket id from cache...
            this.toUser = await redis.get(this.cacheKey);

            socket.on(
                SocketEvents.REQUEST_TEXT_STREAM,
                async (prompt: string) => {
                    Logger.debug(prompt);
                    await this.EmitTextResponse(prompt);
                }
            );

            socket.on(
                SocketEvents.REQUEST_AUDIO_STREAM,
                async (data: RequestAudio) => {
                    await this.EmitAudioResponse(data);
                }
            );

            socket.on('error', (error) => {
                throw error;
            });

            socket.on(SocketEvents.DISCONNECT, () => {
                this.toUser = null;
                this.completeResponse = '';
                this.cacheKey = JwtHelper.getUserIdFromToken(
                    getCookieToken(this.socket)
                );
                redis.del(this.cacheKey);
                this.cacheKey = '';
            });
        });
    }

    private async EmitTextResponse(prompt: string) {
        if (this.toUser) {
            await AiResponder(
                prompt,
                async (response: string, isCompleted: boolean, err: Error) => {
                    if (err) {
                        Logger.error(err.message);
                    } else {
                        if (isCompleted) {
                            SocketServer.io
                                .to(this.toUser)
                                .emit(SocketEvents.RESPONSE_TEXT_STREAM, {
                                    response: null,
                                    isCompleted,
                                });

                            StreamSaver.saveStream(
                                this.cacheKey,
                                prompt,
                                response
                            );
                        } else {
                            if (
                                response &&
                                response !== '' &&
                                response !== 'SAFETY'
                            ) {
                                SocketServer.io
                                    .to(this.toUser)
                                    .emit(SocketEvents.RESPONSE_TEXT_STREAM, {
                                        response,
                                        isCompleted,
                                    });
                            } else {
                                SocketServer.io
                                    .to(this.toUser)
                                    .emit(SocketEvents.RESPONSE_TEXT_STREAM, {
                                        response: `I'm sorry, I cannot respond to that`,
                                        isCompleted: true,
                                    });
                            }
                        }
                    }
                }
            );
        }
    }

    private async EmitAudioResponse(data: RequestAudio) {
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

        const prompt = response.results
            .map((result) => result.alternatives[0].transcript)
            .join('\n');

        SocketServer.io.to(this.toUser).emit(SocketEvents.REQUEST_PROMPT_TEXT, {
            prompt,
        });

        await AiResponder(
            prompt,
            async (response: string, isCompleted: boolean, err: Error) => {
                try {
                    if (err) {
                        Logger.error(err);
                    } else {
                        if (isCompleted) {
                            SocketServer.io
                                .to(this.toUser)
                                .emit(SocketEvents.RESPONSE_TEXT_STREAM, {
                                    response: null,
                                    isCompleted,
                                });

                            let pollyResponse;
                            try {
                                pollyResponse = await pollyClient.send(
                                    pollyCommand(response)
                                );
                            } catch (error: unknown) {
                                if (error instanceof Error) {
                                    Logger.error(
                                        'Error in AudioStream: ' + error.message
                                    );
                                }
                            }

                            let audioStream: Uint8Array;

                            try {
                                audioStream =
                                    await pollyResponse.AudioStream.transformToByteArray();
                            } catch (error: unknown) {
                                if (error instanceof Error) {
                                    Logger.error(
                                        'Error in audioStream while conferting to byteArray: ' +
                                            error.message
                                    );
                                }
                            }

                            SocketServer.io
                                .to(this.toUser)
                                .emit(SocketEvents.RESPONSE_AUDIO_STREAM, {
                                    audioStream,
                                });

                            StreamSaver.saveStream(
                                this.cacheKey,
                                prompt,
                                response
                            );
                        } else {
                            if (
                                response &&
                                response !== '' &&
                                response !== 'SAFETY'
                            ) {
                                SocketServer.io
                                    .to(this.toUser)
                                    .emit(SocketEvents.RESPONSE_TEXT_STREAM, {
                                        response,
                                        isCompleted,
                                    });
                            } else {
                                SocketServer.io
                                    .to(this.toUser)
                                    .emit(SocketEvents.REQUEST_TEXT_STREAM, {
                                        response: `I'm sorry, I cannot respond to that`,
                                        isCompleted: true,
                                    });
                            }
                        }
                    }
                } catch (e) {
                    Logger.error(e);
                }
            }
        );
    }
}
