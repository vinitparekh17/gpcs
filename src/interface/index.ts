export { IUser, User, CustomPayload } from './User';
export { EmailFormat } from './Email';
export { ChunkObj, RequestAudio, SocketEvents } from './Stream';

declare global {
    namespace Express {
        interface Application {
            useMiddleware(): void;
            useSocket(): void;
            usePassport(): void;
            useDatabase(): void;
        }
    }
}
