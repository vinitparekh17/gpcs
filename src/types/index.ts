export { IUser, User, CustomPayload } from './User';
export { EmailFormat }  from './Email';
export { Message }  from './Message';
export { AssistantInput, IAssistant, AssistantType }  from './Assistant';
export { ChunkObj, RequestAudio, SocketEvents }  from './Stream';


declare module 'express-serve-static-core' {
    interface Application {
        useMiddleware(): void;
        useSocket(): void;
        usePassport(): void;
        useDatabase(): void;
    }
}
