import { eq } from "drizzle-orm";
import { AssistantTable } from "../schema/assistant.ts";
import { Logger } from "../../../utils/index.ts";
import { db } from "../connect.ts";
import { AssistantType, IAssistant } from "../../../types/index.ts";

export class Assistant implements IAssistant {
  id?: string | undefined;
  name: string;
  preConfig: string;
  avatar: string | null;
  userId: string;
  createdAt?: Date;

  constructor(assistant: AssistantType) {
    this.id = assistant.id;
    this.name = assistant.name;
    this.preConfig = assistant.preConfig;
    this.avatar = assistant.avatar;
    this.userId = assistant.userId;
    this.createdAt = assistant.createdAt;
  }

  insert(): Promise<AssistantType> {
    return Assistant._checkAssistantLimit(this.userId).then(
      async (canInsert) => {
        if (!canInsert) {
          throw new Error("User can only have 2 assistants");
        }
        return await db
          .insert(AssistantTable)
          .values({
            name: this.name,
            preConfig: this.preConfig,
            avatar: this.avatar,
            userId: this.userId,
            type: "CUSTOM",
          })
          .returning()
          .then((assistant) => assistant[0]);
      },
    );
  }
  static async update(
    newData: AssistantType,
    assistantId: string,
  ): Promise<AssistantType> {
    return await db
      .update(AssistantTable)
      .set({
        name: newData.name,
        preConfig: newData.preConfig,
        avatar: newData.avatar,
      })
      .where(eq(AssistantTable.id, assistantId))
      .returning()
      .then((assistant) => assistant[0]);
  }
  static async delete(assistantId: string): Promise<boolean> {
    return await db
      .delete(AssistantTable)
      .where(eq(AssistantTable.id, assistantId))
      .returning({ deletedId: AssistantTable.id })
      .then((assistant) => assistant.length > 0);
  }

  static getByUserId(userId: string): Promise<AssistantType[]> {
    try {
      return db
        .select()
        .from(AssistantTable)
        .where(eq(AssistantTable.userId, userId))
        .then((assistant) => assistant);
    } catch (error) {
      Logger.error(error);
      throw error;
    }
  }

  static publish(assistantId: string): Promise<boolean> {
    try {
      return db
        .update(AssistantTable)
        .set({
          type: "COMMUNITY",
        })
        .where(eq(AssistantTable.id, assistantId))
        .then(() => true);
    } catch (error) {
      Logger.error(error);
      throw error;
    }
  }

  async getAllPublished(): Promise<AssistantType[]> {
    return await db
      .select()
      .from(AssistantTable)
      .where(eq(AssistantTable.type, "COMMUNITY"));
  }

  private static async _checkAssistantLimit(
    userId: string,
  ): Promise<boolean> {
    return await db
      .select()
      .from(AssistantTable)
      .where(eq(AssistantTable.userId, userId))
      .then((assistant) => assistant.length < 2);
  }
}
