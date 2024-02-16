import { CommandHandlerFactory, handleResult } from "@commands";
import { qualify } from "@config";
import { Request, Response, Express } from "express";
import { CreateFileCommand } from "./createFileCommand";
import { CreateFilePostmodel } from "./createFilePostmodel";

export const mapCreateFileRoute = (
  app: Express,
  handler: CommandHandlerFactory
) => {
  app.post("/files/create", async (req: Request, res: Response) => {
    const postmodel = req.body as CreateFilePostmodel;
    const command = new CreateFileCommand(
      qualify(postmodel.location),
      postmodel.filename,
      postmodel.contents ?? ""
    );
    const result = await handler.handle(command);
    handleResult(result, res);
  });
};
