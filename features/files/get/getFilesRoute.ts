import { Express, Request, Response } from "express";
import fs from "fs";
import { config } from "@config";
import { mapFolder } from "../../../backend/folderMapper";
import { filesCache } from "../files-cache";

export const addGetFilesRoute = (app: Express) => {
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

    const filesResponse = await mapFolder(
      fullFolder,
      (req.query.folder as string) ?? ""
    );

    if (!filesCache.has(req.query.folder as string)) {
      filesCache.add(req.query.folder as string, filesResponse);
    }

    res.status(200).send(filesResponse);
  });
};
