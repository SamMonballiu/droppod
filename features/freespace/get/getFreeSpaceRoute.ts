import { Express, Request, Response } from "express";
import checkDiskSpace from "check-disk-space";
import { config } from "@config";
import { DiskSpaceResponse } from "../../../models/response";

export const mapGetDiskspaceRoute = (app: Express) => {
  app.get("/freespace", async (req: Request, res: Response) => {
    const result = await checkDiskSpace(config.basePath);
    const response: DiskSpaceResponse = {
      freeSpace: result.free,
      size: result.size,
    };
    res.status(200).send(response);
  });
};
