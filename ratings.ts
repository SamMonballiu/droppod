import storage from "node-persist";
import { FileRating } from "./models/fileinfo";

storage.init({
  dir: "ratings",
  encoding: "utf8",
});

const get = async (filename: string): Promise<FileRating | undefined> => {
  return await storage.getItem(filename);
};

const set = async (filename: string, rating: FileRating) => {
  await storage.setItem(filename, rating);
};

const transfer = async (
  sourceFilename: string,
  destinationFilename: string
) => {
  const rating = await get(sourceFilename);

  if (rating === undefined) {
    return;
  }

  await set(destinationFilename, rating);
  await remove(sourceFilename);
};

const remove = async (filename: string) => await storage.removeItem(filename);

export interface RatingsService {
  get: (filename: string) => Promise<FileRating | undefined>;
  set: (filename: string, rating: FileRating) => Promise<void>;
  remove: (filename: string) => Promise<unknown>;
  transfer: (
    sourceFilename: string,
    destinationFilename: string
  ) => Promise<void>;
}

export const ratings: RatingsService = {
  get,
  set,
  remove,
  transfer,
};
