interface CachedThumbnail {
  size: string;
  quality: number;
  thumbnail: Buffer;
}

const _cache: Record<string, CachedThumbnail[]> = {};

const addToCache = (
  filename: string,
  size: string,
  quality: number,
  thumbnail: Buffer
) => {
  if (_cache[filename] === undefined) {
    _cache[filename] = [];
  }

  _cache[filename].push({ size, quality, thumbnail });
};

const isCached = (filename: string, size: string, quality: number): boolean => {
  if (_cache[filename] === undefined) {
    return false;
  }

  return (
    _cache[filename].find((x) => x.size === size && x.quality === quality) !==
    undefined
  );
};

const getCached = (
  filename: string,
  size: string,
  quality: number
): Buffer | undefined => {
  if (isCached(filename, size, quality)) {
    return _cache[filename]!.find(
      (x) => x.size === size && x.quality == quality
    )!.thumbnail!;
  }

  return undefined;
};

export const cache = {
  add: addToCache,
  has: isCached,
  get: getCached,
};
