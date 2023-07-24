import { CommandHandlerFactory, handleResult } from "@commands";
import { Express, Request, Response } from "express";
import { DeleteCommand } from "./deleteCommand";
import { DeletePostmodel } from "./deleteFilePostmodel";

export const mapDeleteFilesRoute = (
  app: Express,
  handler: CommandHandlerFactory
) => {
  app.post("/files/delete", async (req: Request, res: Response) => {
    const postmodel = req.body as DeletePostmodel;
    const command = new DeleteCommand(postmodel.path, postmodel.names);
    const result = await handler.handle(command);
    handleResult(result, res);
  });
};
