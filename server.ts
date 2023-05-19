import * as dotenv from "dotenv"; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config();
import express from "express";
import cors from "cors";
import fs from "fs";
import { cache as thumbnailCache } from "./thumbnail-cache";
import argv from "minimist";
import { CommandHandlerFactory } from "./commands/base";
import { config } from "./config";
import { addMoveFilesRoute } from "./features/files/move/moveFilesRoute";
import { addCreateFolderRoute } from "./features/folders/create/createFolderRoute";
import { addUploadFilesRoute } from "./features/files/upload/uploadFilesRoute";
import { addSetFileRatingRoute } from "./features/files/setRating/setFileRatingRoute";
import { addRenameFileRoute } from "./features/files/rename/renameFileRoute";
import { addGetFilesRoute } from "./features/files/get/getFilesRoute";
import { addGetFoldersRoute } from "./features/folders/get/getFoldersRoute";
import { addGetThumbnailsRoute } from "./features/thumbnails/get/getThumbnailsRoute";

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
addGetFilesRoute(app);
addGetFoldersRoute(app);
addGetThumbnailsRoute(app, thumbnailCache);

app.listen(port, () => {
  console.log(`Server started on port ${port}.`);
});
