import {
  CreateFolderPostmodel,
  DeletePostmodel,
  MoveFilesPostModel,
  RenamePostModel,
  SetFileRatingPostmodel,
} from "./models/post/index";
import * as dotenv from "dotenv"; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config();
import express, { Request, Response } from "express";
import multer from "multer";
import path from "path";
import { FolderInfo } from "./models/folderInfo";
import cors from "cors";
import fs from "fs";
import { generateThumbnail } from "./thumbnail";
import { cache as thumbnailCache } from "./thumbnail-cache";
import argv from "minimist";
import { CommandHandlerFactory, handleResult } from "./commands/base";
import { CreateFolderCommand } from "./commands/createFolderCommand";
import { fdir } from "fdir";
import { filesCache } from "./files-cache";
import { config } from "./config";
import { SetFileRatingCommand } from "./commands/setFileRatingCommand";
import { MoveFilesCommand } from "./commands/moveFilesCommand";
import { RenameCommand } from "./commands/renameCommand";
import { mapFolder } from "./backend/folderMapper";
import { DeleteCommand } from "./commands/deleteCommand";

const args = argv(process.argv);

if (!fs.existsSync(config.basePath)) {
  console.log(
    "The base path specified in the .env doesn't exist: ",
    config.basePath
  );
  console.log(
    "Please ensure that the .env file exists and the BASE_PATH parameter points to a valid path."
  );
  process.exit();
}

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

const app = express();
app.use(express.static(config.basePath));
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

const handler = new CommandHandlerFactory();
const port = args.port ?? 4004;

app.post("/upload_files", upload.array("files"), async (_, res: Response) => {
  res.status(200).send("ok");
});

app.post("/folders/create", async (req: Request, res: Response) => {
  const postmodel = req.body as CreateFolderPostmodel;
  const command = new CreateFolderCommand(
    path.join(config.basePath, postmodel.location),
    postmodel.folderName
  );
  const result = await handler.handle(command);
  handleResult(result, res);
});

app.post("/files/move", async (req: Request, res: Response) => {
  const postmodel = req.body as MoveFilesPostModel;
  const command = new MoveFilesCommand(
    postmodel.location,
    postmodel.filenames,
    postmodel.destination
  );
  const result = await handler.handle(command);
  handleResult(result, res);
});

app.post("/rate-file", async (req: Request, res: Response) => {
  const postmodel = req.body as SetFileRatingPostmodel;
  const command = new SetFileRatingCommand(
    postmodel.path,
    postmodel.filename,
    postmodel.rating
  );
  const result = await handler.handle(command);
  handleResult(result, res);
});

app.post("/files/rename", async (req: Request, res: Response) => {
  const postmodel = req.body as RenamePostModel;
  const command = new RenameCommand(
    postmodel.path,
    postmodel.currentName,
    postmodel.newName
  );
  const result = await handler.handle(command);
  handleResult(result, res);
});

app.post("/files/delete", async (req: Request, res: Response) => {
  const postmodel = req.body as DeletePostmodel;
  const command = new DeleteCommand(postmodel.path, postmodel.names);
  const result = await handler.handle(command);
  handleResult(result, res);
});

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

app.get("/thumbnail", async (req: Request, res: Response) => {
  const file = req.query.file as string;
  if (!req.query.size && !req.query.percentage) {
    res.status(400).send("Must supply either a size or a percentage.");
  }

  let size = null;
  if (req.query.size) {
    const [height, width] = (req.query.size as string)
      .split("x")
      .map((d) => parseInt(d));

    size = { height, width };
  }

  let percentage = 0;
  if (req.query.percentage) {
    percentage = parseInt(req.query.percentage as string);
  }

  const quality = req.query.quality
    ? parseInt(req.query.quality as string)
    : 60;

  let thumbnail: Buffer;
  if (thumbnailCache.has(file, req.query.size as string, quality)) {
    thumbnail = thumbnailCache.get(file, req.query.size as string, quality)!;
  } else {
    try {
      thumbnail = await generateThumbnail(
        config.basePath,
        file,
        size ?? { percentage },
        quality
      );

      thumbnailCache.add(file, req.query.size as string, quality, thumbnail);
    } catch (err) {
      console.log(err);
      thumbnail = Buffer.from([]);
    }
  }

  res.setHeader("content-type", "image/jpeg").status(200).send(thumbnail);
});

app.listen(port, () => {
  console.log(`Server started on port ${port}.`);
});
