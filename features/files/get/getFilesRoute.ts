import { Express, Request, Response } from "express";
import fs from "fs";
import { config } from "@config";
import { filesCache } from "../files-cache";
import { mapFolder } from "../../../backend/goFolderMapper";

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

    await mapFolder({
      path: (req.query.folder as string) ?? "/",
      onSuccess: (response) => {
        if (!filesCache.has(req.query.folder as string)) {
          filesCache.add(req.query.folder as string, response);
        }
        res.status(200).send(response);
      },
      onError: (msg) => res.status(500).send(msg),
    });
  });
};
