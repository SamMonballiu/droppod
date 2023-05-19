import * as dotenv from "dotenv"; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config();
import express, { Request, Response } from "express";
import { FolderInfo } from "./models/folderInfo";
import cors from "cors";
import fs from "fs";
import { generateThumbnail } from "./thumbnail";
import { cache as thumbnailCache } from "./thumbnail-cache";
import argv from "minimist";
import { CommandHandlerFactory } from "./commands/base";
import { fdir } from "fdir";
import { filesCache } from "./features/files/files-cache";
import { config } from "./config";
import { mapFolder } from "./backend/folderMapper";
import { addMoveFilesRoute } from "./features/files/move/moveFilesRoute";
import { addCreateFolderRoute } from "./features/folders/create/createFolderRoute";
import { addUploadFilesRoute } from "./features/files/upload/uploadFilesRoute";
import { addSetFileRatingRoute } from "./features/files/setRating/setFileRatingRoute";
import { addRenameFileRoute } from "./features/files/rename/renameFileRoute";

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

addUploadFilesRoute(app);
addCreateFolderRoute(app, handler);
addMoveFilesRoute(app, handler);
addSetFileRatingRoute(app, handler);
addRenameFileRoute(app, handler);

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
