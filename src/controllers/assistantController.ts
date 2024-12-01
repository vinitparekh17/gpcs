import { Request, Response } from "express";
import { Err, Success } from "../utils/index.ts";
import { AsyncHandler } from "../handlers/index.ts";
import { Assistant } from "../db/postgresql/models/Assistant.ts";
import { AssistantInput } from "../types/index.ts";

export const getAssistant = AsyncHandler(
  async (req: Request, res: Response): Promise<Response> => {
    if (!req.user || !req.user.id) {
      throw new Error("User not found");
    }

    const assistant = await Assistant.getByUserId(req.user.id);
    if (assistant.length === 0) {
      return Err.send(res, 404, "You do not have an assistant");
    }
    return Success.send(res, 200, assistant);
  },
);

export const createAssistant = AsyncHandler(
  async (req: Request, res: Response): Promise<Response> => {
    const { name, preConfig, avatar } = req.body as AssistantInput;
    if (!name || !preConfig) {
      return Err.send(res, 400, "Name and preConfig are required");
    }

    const assistant = new Assistant({
      avatar,
      name,
      preConfig,
      type: "CUSTOM",
      userId: req.user.id!,
      createdAt: new Date(),
    });

    const newAssistant = await assistant.insert();
      return Success.send(res, 201, newAssistant);
  },
);

export const publishAssistant = AsyncHandler(
  async (req: Request, res: Response): Promise<Response> => {
    const { assistantId } = req.params;

    if (assistantId) {
      const publishStatus = await Assistant.publish(assistantId)
          if (publishStatus) {
            return Success.send(
              res,
              200,
              "Your assistant has been published for community",
            );
          }

          return Err.send(res, 401, "Unable to publish your assistant");
    }

    return Err.send(res, 400, "Assistant id not found");
  },
);

export const updateAssistant = AsyncHandler(
  async (req: Request, res: Response): Promise<Response> => {
    const { name, preConfig, avatar } = req.body as AssistantInput;

    if (!name || !preConfig) {
      return Err.send(res, 400, "Name and preConfig are required");
    }

    const updatedAssistant = await Assistant.update(
      {
        id: req.params.id,
        userId: req.user.id!,
        name,
        preConfig,
        avatar,
      },
      req.params.id,
    );

    return Success.send(res, 200, updatedAssistant);
  },
);
