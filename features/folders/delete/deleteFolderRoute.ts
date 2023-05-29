import { CommandHandlerFactory, handleResult } from "@commands";
import { Express, Request, Response } from "express";
import { DeleteFolderCommand } from "./deleteFolderCommand";
import { DeleteFolderPostmodel } from "./deleteFolderPostmodel";

export const mapDeleteFolderRoute = (
  app: Express,
  handler: CommandHandlerFactory
) => {
  app.post("/folders/delete", async (req: Request, res: Response) => {
    const postmodel = req.body as DeleteFolderPostmodel;
    const command = new DeleteFolderCommand(
      postmodel.parentPath,
      postmodel.folderName
    );
    const result = await handler.handle(command);
    handleResult(result, res);
  });
};
