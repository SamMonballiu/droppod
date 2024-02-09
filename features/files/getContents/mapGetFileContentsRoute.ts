import { config, qualify } from "@config";
import { Express, Request, Response } from "express";
import fs from "fs-extra";

export const mapGetFileContentsRoute = (app: Express) => {
  app.get("/files/contents", async (req: Request, res: Response) => {
    const fullPath = qualify((req.query.path as string) ?? "");

    if (!fs.existsSync(fullPath)) {
      res.status(400).send("The specified file doesn't exist.");
      return;
    }

    const contents = fs.readFileSync(fullPath);
    res.status(200).send(contents);
  });
};
