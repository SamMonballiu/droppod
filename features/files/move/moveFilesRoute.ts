import { CommandHandlerFactory, handleResult } from "@commands";
import { MoveFilesCommand } from "./moveFilesCommand";
import { MoveFilesPostModel } from "./moveFilesPostModel";
import { Request, Response, Express } from "express";

export const mapMoveFilesRoute = (
  app: Express,
  handler: CommandHandlerFactory
) => {
  app.post("/files/move", async (req: Request, res: Response) => {
    const postmodel = req.body as MoveFilesPostModel;
    const command = new MoveFilesCommand(
      postmodel.location,
      postmodel.filenames,
      postmodel.destination
    );
    const result = await handler.handle(command);
    handleResult(result, res);
  });
};
