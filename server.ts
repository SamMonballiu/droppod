import express, { Request, Response } from "express";
import multer from "multer";
import path from "path";
import { FileInfo, isImageExtension } from "./models/fileinfo";
import { FilesResponse } from "./models/response";
import cors from "cors";
import os from "os";
import fs from "fs";
import { generateThumbnail } from "./thumbnail";
import checkDiskSpace from "check-disk-space";
import sizeOf from "image-size";
import { cache } from "./thumbnail-cache";
import argv from "minimist";

const args = argv(process.argv);

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

app.post("/upload_files", upload.array("files"), async (_, res: Response) => {
  res.status(200).send("ok");
});

app.get("/files", async (_, res: Response) => {
  const folder = __dirname + "/public/uploads/";
  const files = fs.readdirSync(folder);

  const result: FileInfo[] = [];

  for (const file of files.filter((f) => !f.startsWith("."))) {
    const extension = path.extname(folder + file);
    const stats = fs.statSync(folder + file);
    let dimensions:
      | { height: number; width: number; orientation: number }
      | undefined = undefined;
    if (isImageExtension(extension)) {
      const info = sizeOf(folder + file);
      dimensions = {
        height: info!.height!,
        width: info!.width!,
        orientation: info!.orientation!,
      };
    }

    const fileInfo: FileInfo = {
      filename: file,
      fullPath: `http://${os.hostname()}:4004/uploads/${file}`,
      extension: path.extname(folder + file),
      size: stats.size,
      dateAdded: stats.ctime,
      dimensions,
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
  const [height, width] = (req.query.size as string)
    .split("x")
    .map((d) => parseInt(d));
  const quality = req.query.quality
    ? parseInt(req.query.quality as string)
    : 60;

  let thumbnail: Buffer;
  if (cache.has(file, req.query.size as string, quality)) {
    thumbnail = cache.get(file, req.query.size as string, quality)!;
  } else {
    thumbnail = await generateThumbnail(
      folder,
      file,
      { height, width },
      quality
    );

    cache.add(file, req.query.size as string, quality, thumbnail);
  }

  res.setHeader("content-type", "image/jpeg").status(200).send(thumbnail);
});

const port = args.port ?? 4004;
app.listen(port, () => {
  console.log(`Server started on port ${port}.`);
});
