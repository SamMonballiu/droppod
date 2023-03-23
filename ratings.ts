import storage from "node-persist";
import { FileRating } from "./models/post";

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

const remove = async (filename: string) => await storage.removeItem(filename);

export interface RatingsService {
  get: (filename: string) => Promise<FileRating | undefined>;
  set: (filename: string, rating: FileRating) => Promise<void>;
  remove: (filename: string) => Promise<unknown>;
}

export const ratings: RatingsService = {
  get,
  set,
  remove,
};
