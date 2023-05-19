import { Express, Request, Response } from "express";
import { fdir } from "fdir";
import { config } from "@config";
import { FolderInfo } from "../../../models/folderInfo";

export const addGetFoldersRoute = (app: Express) => {
  app.get("/folders", async (req: Request, res: Response) => {
    const directories = new fdir()
      .withMaxDepth(1)
      .onlyDirs()
      .crawl(config.basePath)
      .sync()
      .filter((x) => x !== config.basePath);

    const crawlDirectory = (pathName: string, parent: string): FolderInfo => {
      const dirs = new fdir()
        .withMaxDepth(1)
        .onlyDirs()
        .crawl(pathName)
        .sync()
        .filter((x) => x !== pathName);

      const mapped: FolderInfo[] = dirs.map((x) => crawlDirectory(x, pathName));

      return {
        name: pathName.replace(parent, "").replace("/", ""),
        parent: parent.replace(config.basePath, ""),
        files: undefined,
        folders: mapped,
      };
    };

    const result: FolderInfo = {
      name: "",
      parent: "",
      files: undefined,
      folders: directories.map((x) => crawlDirectory(x, config.basePath)),
    };

    res.status(200).send(result);
  });
};
