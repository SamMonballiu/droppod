import { CommandHandlerFactory, handleResult } from "@commands";
import { Express, Request, Response } from "express";
import { RenamePostModel } from "../../files/rename/renameFilePostmodel";
import { RenameFolderCommand } from "./renameFolderCommand";

export const mapRenameFolderRoute = (
  app: Express,
  handler: CommandHandlerFactory
) => {
  app.post("/folders/rename", async (req: Request, res: Response) => {
    const postmodel = req.body as RenamePostModel;
    const command = new RenameFolderCommand(
      postmodel.path,
      postmodel.currentName,
      postmodel.newName
    );
    const result = await handler.handle(command);
    handleResult(result, res);
  });
};
