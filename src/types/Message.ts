import type { types } from "cassandra-driver";

export type Message = {
  id?: types.Uuid;
  user: string;
  prompt: string;
  response: string;
  created?: number;
};
