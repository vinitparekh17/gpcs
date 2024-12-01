export type AssistantType = {
  id?: string | undefined;
  name: string;
  preConfig: string;
  type?: "CUSTOM" | "COMMUNITY";
  avatar: string | null;
  userId: string;
  createdAt?: Date;
};

export interface IAssistant {
  name: string;
  preConfig: string;
  avatar: string | null;
  userId: string;
  insert(userId: string): Promise<AssistantType>;
}

export type AssistantInput = {
  name: string;
  preConfig: string;
  avatar: string | null;
};
