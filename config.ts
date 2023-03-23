import path from "path";

export const config = {
  basePath: process.env.BASE_PATH ?? "",
};

export const qualify = (...paths: string[]) => {
  return path.join(config.basePath, ...paths);
};
