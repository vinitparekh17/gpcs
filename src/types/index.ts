export type { CustomPayload, IUser, User } from "./User.ts";
export type { EmailFormat } from "./Email.ts";
export type { Message } from "./Message.ts";
export type { AssistantInput, AssistantType, IAssistant } from "./Assistant.ts";
export type { ChunkObj, RequestAudio } from "./Stream.ts";

declare module "express" {
  interface Application {
    useMiddleware(): void;
    useSocket(): void;
    usePassport(): void;
    useDatabase(): void;
  }
}
