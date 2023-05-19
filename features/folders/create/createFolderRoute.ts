import { CommandHandlerFactory, handleResult } from "@commands";
import { config } from "@config";
import { Request, Response, Express } from "express";
import { CreateFolderCommand } from "./createFolderCommand";
import { CreateFolderPostmodel } from "./createFolderPostmodel";
import path from "path";

export const addCreateFolderRoute = (
  app: Express,
  handler: CommandHandlerFactory
) => {
  app.post("/folders/create", async (req: Request, res: Response) => {
    const postmodel = req.body as CreateFolderPostmodel;
    const command = new CreateFolderCommand(
      path.join(config.basePath, postmodel.location),
      postmodel.folderName
    );
    const result = await handler.handle(command);
    handleResult(result, res);
  });
};
