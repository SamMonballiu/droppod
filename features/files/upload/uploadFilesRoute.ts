import { Express, Request, Response } from "express";
import path from "path";
import multer from "multer";
import { filesCache } from "../files-cache";
import { config } from "@config";

const storage = multer.diskStorage({
  destination: function (req: Request, file, cb) {
    const folder = req.query.folder as string;
    filesCache.invalidate(folder);
    cb(null, path.join(config.basePath, folder));
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

export const mapUploadFilesRoute = (app: Express) => {
  app.post("/upload_files", upload.array("files"), async (_, res: Response) => {
    res.status(200).send("ok");
  });
};
