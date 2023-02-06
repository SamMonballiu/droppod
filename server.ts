import express, { Request, Response } from "express";
import multer from "multer";
import path from "path";
import { FileInfo, isImageExtension } from "./models/fileinfo";
import cors from "cors";
import os from "os";
import fs from "fs";
import { generateThumbnail, getThumbnailPath } from "./thumbnail";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, __dirname + "/public/uploads");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

const app = express();
app.use(express.static(__dirname + "/public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: function (origin, callback) {
      return callback(null, true);
    },
    optionsSuccessStatus: 200,
    credentials: true,
  })
);

app.post(
  "/upload_files",
  upload.array("files"),
  async (req: Request, res: Response) => {
    const uploaded = req["files"] as { filename: string }[];
    for (const file of uploaded) {
      await generateThumbnail(__dirname + "/public/uploads/", file.filename);
    }
    res.status(200).send("ok");
  }
);

app.get("/files", async (_, res: Response) => {
  const folder = __dirname + "/public/uploads/";
  const files = fs.readdirSync(folder);

  const result: FileInfo[] = [];

  for (const file of files.filter((f) => !f.startsWith("."))) {
    const extension = path.extname(folder + file);

    const fileInfo: FileInfo = {
      filename: file,
      fullPath: `http://${os.hostname()}:4004/uploads/${file}`,
      extension: path.extname(folder + file),
      size: fs.statSync(folder + file).size,
      thumbnailPath: isImageExtension(extension)
        ? await getThumbnailPath(folder, file)
        : undefined,
    };

    result.push(fileInfo);
  }

  res.status(200).send(result);
});

app.listen(4004, () => {
  console.log("Server started...");
});
