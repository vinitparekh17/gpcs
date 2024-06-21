// interface Message {
//   prompt: MessageFormat;
//   answer: MessageFormat;
//   date: Date;
//   user: {
//     _id: Schema.Types.ObjectId;
//     name: string;
//   };
// }

import type { types } from 'cassandra-driver';

export type Message = {
    id?: types.Uuid;
    user: string;
    prompt: string;
    response: string;
    created?: number;
};
