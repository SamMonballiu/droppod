import { fdir } from "fdir";
import path from "path";
import { config } from "../config";
import { FileInfo, isImageExtension } from "../models/fileinfo";
import { FolderInfo } from "../models/folderInfo";
import sizeOf from "image-size";
import fs from "fs-extra";
import os from "os";
import { ratings } from "../ratings";
import { FilesResponse } from "../models/response";
import checkDiskSpace from "check-disk-space";

export const mapFolder = async (
  fullFolder: string,
  folderName: string
): Promise<FilesResponse> => {
  const fileCrawler = new fdir()
    .withMaxDepth(0)
    .withRelativePaths()
    .crawl(fullFolder);

  const directoryCrawler = new fdir()
    .withMaxDepth(1)
    .withRelativePaths()
    .onlyDirs()
    .crawl(fullFolder);

  const files = fileCrawler.sync();
  const directories = directoryCrawler.sync();

  const result: FolderInfo = {
    name: folderName,
    parent: path.dirname(fullFolder).replace(config.basePath, "").substring(1),
    files: [],
    folders: directories.slice(1).map((dir) => ({
      name: dir.replace(fullFolder, "").replace("/", ""),
      parent: folderName,
      files: [],
      folders: [],
      dateAdded: new Date(),
    })),
  };

  for (const entry of files) {
    const extension = path.extname(fullFolder + entry);
    const stats = fs.statSync(fullFolder + entry);

    let dimensions:
      | { height: number; width: number; orientation: number }
      | undefined = undefined;
    if (isImageExtension(extension)) {
      //TODO library does not support RAW files
      const info = sizeOf(fullFolder + entry);
      dimensions = {
        height: info!.height!,
        width: info!.width!,
        orientation: info!.orientation!,
      };
    }

    const fileInfo: FileInfo = {
      filename: entry,
      fullPath:
        "http://" +
        path.join(`${os.hostname()}:${config.port}`, folderName, entry),
      relativePath: folderName,
      extension: path.extname(fullFolder + entry),
      size: stats.size,
      dateAdded: stats.ctime,
      rating: await ratings.get(path.join(folderName, entry)),
      dimensions,
    };

    result.files!.push(fileInfo);
  }

  return {
    freeSpace: (await checkDiskSpace(fullFolder)).free,
    contents: result,
  };
};
