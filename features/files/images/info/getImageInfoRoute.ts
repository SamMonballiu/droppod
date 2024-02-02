import { Express, Request, Response } from "express";
import { config } from "@config";
import sizeOf from "image-size";
import path from "path";
import { ImageInfoResponse } from "../../../../models/response";

export const mapGetImageInfoRoute = (app: Express) => {
  app.get("/image/info", async (req: Request, res: Response) => {
    if (!req.query.path) {
      res.status(400).send("Must supply path to an image.");
    }
    try {
      const info = sizeOf(path.join(config.basePath, req.query.path as string));
      const response: ImageInfoResponse = {
        dimensions: {
          width: info!.width!,
          height: info!.height!,
        },
        orientation: info!.orientation!,
      };

      res.status(200).send(response);
    } catch (err) {
      res.status(500).send(err);
    }
  });
};
