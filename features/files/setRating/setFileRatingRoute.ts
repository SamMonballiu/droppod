import { CommandHandlerFactory, handleResult } from "@commands";
import { Express, Request, Response } from "express";
import { SetFileRatingCommand } from "./setFileRatingCommand";
import { SetFileRatingPostmodel } from "./setFileRatingPostModel";

export const mapSetFileRatingRoute = (
  app: Express,
  handler: CommandHandlerFactory
) => {
  //TODO change URL
  app.post("/rate-file", async (req: Request, res: Response) => {
    const postmodel = req.body as SetFileRatingPostmodel;
    const command = new SetFileRatingCommand(
      postmodel.path,
      postmodel.filename,
      postmodel.rating
    );
    const result = await handler.handle(command);
    handleResult(result, res);
  });
};
