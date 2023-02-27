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

export const ratings = {
  get,
  set,
  remove,
};
