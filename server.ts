import * as dotenv from "dotenv"; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config();
import express from "express";
import cors from "cors";
import fs from "fs";
import { cache as thumbnailCache } from "./thumbnail-cache";
import argv from "minimist";
import { CommandHandlerFactory } from "./commands/base";
import { config } from "./config";
import { mapMoveFilesRoute } from "./features/files/move/moveFilesRoute";
import { mapCreateFolderRoute } from "./features/folders/create/createFolderRoute";
import {
  mapUploadFilesRoute,
  mapUploadFromUrlRoute,
} from "./features/files/upload/uploadFilesRoute";
import { mapSetFileRatingRoute } from "./features/files/setRating/setFileRatingRoute";
import { mapRenameFileRoute } from "./features/files/rename/renameFileRoute";
import { mapGetFilesRoute } from "./features/files/get/getFilesRoute";
import { mapGetFoldersRoute } from "./features/folders/get/getFoldersRoute";
import { mapGetThumbnailsRoute } from "./features/thumbnails/get/getThumbnailsRoute";
import { mapDeleteFilesRoute } from "./features/files/delete/deleteFileRoute";
import { mapDeleteFolderRoute } from "./features/folders/delete/deleteFolderRoute";
import { mapRenameFolderRoute } from "./features/folders/rename/renameFolderRoute";

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

mapGetFilesRoute(app);
mapUploadFilesRoute(app);
mapUploadFromUrlRoute(app, handler);
mapMoveFilesRoute(app, handler);
mapRenameFileRoute(app, handler);
mapDeleteFilesRoute(app, handler);
mapSetFileRatingRoute(app, handler);
mapGetThumbnailsRoute(app, thumbnailCache);

mapCreateFolderRoute(app, handler);
mapGetFoldersRoute(app);
mapDeleteFolderRoute(app, handler);
mapRenameFolderRoute(app, handler);

app.listen(port, () => {
  console.log(`Server started on port ${port}.`);
});
