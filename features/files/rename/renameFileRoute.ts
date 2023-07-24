import { CommandHandlerFactory, handleResult } from "@commands";
import { Express, Request, Response } from "express";
import { RenameCommand } from "./renameCommand";
import { RenamePostModel } from "./renameFilePostmodel";

export const mapRenameFileRoute = (
  app: Express,
  handler: CommandHandlerFactory
) => {
  app.post("/files/rename", async (req: Request, res: Response) => {
    const postmodel = req.body as RenamePostModel;
    const command = new RenameCommand(
      postmodel.path,
      postmodel.currentName,
      postmodel.newName
    );
    const result = await handler.handle(command);
    handleResult(result, res);
  });
};
