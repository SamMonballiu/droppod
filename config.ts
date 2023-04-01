import path from "path";
import argv from "minimist";

export const config = {
  basePath: process.env.BASE_PATH ?? "",
  port: argv(process.argv).port ?? 4004,
};

export const qualify = (...paths: string[]) => {
  return path.join(config.basePath, ...paths);
};
