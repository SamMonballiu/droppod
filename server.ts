import express, { Request, Response } from "express";
import multer from "multer";
import path from "path";
import { FileInfo, isImageExtension } from "./models/fileinfo";
import { FilesResponse } from "./models/response";
import cors from "cors";
import os from "os";
import fs from "fs";
import { Format, generateThumbnail, getThumbnailPath } from "./thumbnail";
import checkDiskSpace from "check-disk-space";

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
      await generateThumbnail(
        __dirname + "/public/uploads/",
        file.filename,
        Format.Standard()
      );
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
    const stats = fs.statSync(folder + file);

    const fileInfo: FileInfo = {
      filename: file,
      fullPath: `http://${os.hostname()}:4004/uploads/${file}`,
      extension: path.extname(folder + file),
      size: stats.size,
      thumbnailPath: isImageExtension(extension)
        ? await getThumbnailPath(folder, file)
        : undefined,
      dateAdded: stats.ctime,
    };

    result.push(fileInfo);
  }

  const filesResponse: FilesResponse = {
    freeSpace: (await checkDiskSpace(folder)).free,
    files: result,
  };

  res.status(200).send(filesResponse);
});

app.get("/thumbnail", async (req: Request, res: Response) => {
  const folder = __dirname + "/public/uploads/";
  const file = req.query.file as string;
  const percentage = req.query.percentage as string;
  const thumbnail = await generateThumbnail(
    folder,
    file,
    { percentage: parseInt(percentage) },
    "return"
  );
  res.status(200).send(thumbnail);
});

app.listen(4004, () => {
  console.log("Server started...");
});
