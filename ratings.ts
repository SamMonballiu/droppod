import storage from "node-persist";
import { FileRatingValue } from "./models/fileinfo";

storage.init({
  dir: "ratings",
  encoding: "utf8",
});

const get = async (filename: string): Promise<FileRatingValue | undefined> => {
  return await storage.getItem(filename);
};

const set = async (filename: string, rating: FileRatingValue) => {
  await storage.setItem(filename, rating);
};

const sanitize = (name: string) => (name.startsWith("/") ? name : "/" + name);

const transfer = async (
  sourceFilename: string,
  destinationFilename: string
) => {
  const [source, destination] = [sourceFilename, destinationFilename].map(
    sanitize
  );

  const rating = await get(source);

  if (rating === undefined) {
    return;
  }

  await set(destination, rating);
  await remove(source);
};

const transferFolder = async (
  sourceFolderName: string,
  destinationFolderName: string
) => {
  const keys = (await storage.keys()).filter((x) =>
    x.startsWith(sourceFolderName)
  );

  for (const key of keys) {
    await transfer(key, key.replace(sourceFolderName, destinationFolderName));
  }
};

const remove = async (filename: string) => await storage.removeItem(filename);

export interface RatingsService {
  get: (filename: string) => Promise<FileRatingValue | undefined>;
  set: (filename: string, rating: FileRatingValue) => Promise<void>;
  remove: (filename: string) => Promise<unknown>;
  transfer: (
    sourceFilename: string,
    destinationFilename: string
  ) => Promise<void>;
  transferFolder: (
    sourceFolderName: string,
    destinationFolderName: string
  ) => Promise<void>;
}

export const ratings: RatingsService = {
  get,
  set,
  remove,
  transfer,
  transferFolder,
};
