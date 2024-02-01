import { Express, Request, Response } from "express";
import fs from "fs";
import { config } from "@config";
import { filesCache } from "../files-cache";
import { ImageInfoResponse } from "../../../models/response";
import sizeOf from "image-size";
import path from "path";
import { folderMapper } from "../../../backend/goFolderMapper";

export const mapGetFilesRoute = (app: Express) => {
  app.get("/files", async (req: Request, res: Response) => {
    let fullFolder = config.basePath;

    if (req.query.folder) {
      fullFolder += req.query.folder + "/";
    }

    if (!fs.existsSync(fullFolder)) {
      res.status(400).send("The specified folder doesn't exist.");
      return;
    }

    if (filesCache.has(fullFolder) && !filesCache.isStale(fullFolder)) {
      res.status(200).send(filesCache.get(fullFolder));
      return;
    }

    await folderMapper((req.query.folder as string) ?? "/")
      .onComplete((response) => {
        if (!filesCache.has(req.query.folder as string)) {
          filesCache.add(req.query.folder as string, response);
        }
        res.status(200).send(response);
      })
      .start();
  });

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
