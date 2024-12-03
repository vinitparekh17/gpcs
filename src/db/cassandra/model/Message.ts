import { cassandraClient } from '../connect.ts';
import type { Message as MessageType } from '../../../types/Message.ts';
import { types } from 'cassandra-driver';

export class Message {
	public message: MessageType;
	private _insertQuery: string =
		`INSERT INTO messaging.messages (id, user, prompt, response, created) VALUES (?, ?, ?, ?, ?);`;
	private static _selectQuery: string =
		'SELECT * FROM messaging.messages WHERE user = ?';
	private static _deleteQuery: string =
		'DELETE FROM messaging.messages WHERE user = ?';

	constructor(messageObj: MessageType) {
		this.message = {
			id: types.Uuid.random(),
			user: messageObj.user,
			prompt: messageObj.prompt,
			response: messageObj.response,
			created: new Date().getTime(),
		};
	}

	async insert() {
		if (
			this.message.id &&
			this.message.created &&
			this.message.user &&
			this.message.prompt &&
			this.message.response
		) {
			await cassandraClient.execute(
				this._insertQuery,
				[
					this.message.id,
					this.message.user,
					this.message.prompt,
					this.message.response,
					this.message.created,
				],
				{ prepare: true },
			);
		} else {
			throw new Error(
				`Invalid message object: ${JSON.stringify(this.message)}`,
			);
		}
	}

	static async findByUser(userId: string): Promise<MessageType[]> {
		const { rows } = await cassandraClient.execute(
			this._selectQuery,
			[userId],
			{ prepare: true },
		);
		return rows as unknown as MessageType[];
	}

	static async delete(user: string) {
		await cassandraClient.execute(this._deleteQuery, [user], {
			prepare: true,
		});
	}
}
