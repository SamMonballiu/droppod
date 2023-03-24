import { FilesCache } from "../files-cache";
import { RatingsService } from "../ratings";

export const mockRatings: RatingsService = {
  get: () => Promise.resolve(undefined),
  set: () => Promise.resolve(),
  remove: () => Promise.resolve(),
};

export const mockFilesCache: FilesCache = {
  add: () => {
    return;
  },
  invalidate: () => {
    return;
  },
  has: () => {
    return true;
  },
  get: () => {
    return undefined;
  },
  isStale: () => {
    return true;
  },
};
