import { FilesResponse } from "./models/response";
import { fdir } from "fdir";

const _cache: Record<string, FilesResponse | undefined> = {};

const addToCache = (folderName: string, response: FilesResponse) => {
  _cache[folderName] = response;
};

const removeFromCache = (folderName: string) => {
  _cache[folderName] = undefined;
};

const getCached = (folderName: string) => {
  return _cache[folderName];
};

const isCached = (folderName: string) => {
  return _cache[folderName] !== undefined;
};

const isStale = (folderName: string) => {
  if (!isCached(folderName)) {
    return false;
  }

  const cached = getCached(folderName);

  const fileCrawler = new fdir()
    .withMaxDepth(0)
    .withRelativePaths()
    .crawl(folderName)
    .sync();

  const directoryCrawler = new fdir()
    .withMaxDepth(1)
    .withRelativePaths()
    .onlyDirs()
    .crawl(folderName)
    .sync();

  return !(
    fileCrawler.length === cached!.contents.files.length &&
    directoryCrawler.slice(1).length === cached!.contents.folders.length
  );
};

export const filesCache = {
  add: addToCache,
  invalidate: removeFromCache,
  has: isCached,
  get: getCached,
  isStale,
};
