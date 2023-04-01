import { FileRating } from "./post";

export interface FileInfo {
  filename: string;
  fullPath: string;
  relativePath: string;
  extension: string;
  size: number;
  dateAdded: Date;
  dimensions?: {
    width: number;
    height: number;
    orientation: Orientation;
  };
  isFolder?: boolean;
  rating?: FileRating;
}

export const isImageExtension = (ext: string) =>
  [".webp", ".jpeg", ".jpg", ".png", ".bmp", ".tif", ".tiff", ".gif"].includes(
    ext.toLowerCase()
  );

export const hasRawExtension = (file: string) => {
  const extensions = [".cr2", ".raf", ".dng"];
  return extensions.some((ext) => file.toLowerCase().endsWith(ext));
};

export const isImage = (file: FileInfo) => getType(file) == FileType.Image;

export enum FileType {
  Unknown,
  Image,
  Video,
  Audio,
  Pdf,
}

export const is = (file: FileInfo, type: FileType) => getType(file) === type;

export const getType = (file: FileInfo): FileType => {
  const extensionMap = new Map<string[], FileType>();
  extensionMap.set([".mp3", ".ogg", ".m4a"], FileType.Audio);
  extensionMap.set([".mp4"], FileType.Video);
  extensionMap.set(
    [
      ".webp",
      ".jpeg",
      ".jpg",
      ".png",
      ".bmp",
      ".tif",
      ".tiff",
      ".gif",
      ".cr2",
      ".raf",
      ".dng",
    ],
    FileType.Image
  );

  for (const entry of extensionMap.entries()) {
    if (entry[0].includes(file.extension.toLowerCase())) {
      return entry[1];
    }
  }

  return FileType.Unknown;
};

export const getOrientation = (
  file: FileInfo
): "landscape" | "portrait" | "square" | undefined => {
  if (file.dimensions === undefined) {
    return undefined;
  }

  if (file.dimensions.width === file.dimensions.height) {
    return "square";
  }

  switch (file.dimensions.orientation) {
    case Orientation.Horizontal:
    case Orientation.MirrorHorizontal:
      return "landscape";
    default:
      return "portrait";
  }
};

// https://exiftool.org/TagNames/EXIF.html#:~:text=0x0112,8%20=%20Rotate%20270%20CW
enum Orientation {
  None,
  Horizontal,
  MirrorHorizontal,
  Rotate180,
  MirrorVertical,
  MirrorHorizontalAndRotate270CW,
  Rotate90CW,
  MirrorHorizontalAndRotate90CW,
  Rotate270CW,
}

export const getSize = (
  file: FileInfo,
  format: "kb" | "mb" | "bytes" | "auto"
) => {
  const size = file.size;

  if (format === "auto") {
    format = size >= 1024 * 1024 ? "mb" : size >= 1024 ? "kb" : "bytes";
  }

  switch (format) {
    case "kb":
      return (file.size / 1024).toFixed(2) + "kb";
    case "mb":
      return (file.size / 1024 / 1024).toFixed(2) + "mb";
    case "bytes":
      return file.size + " bytes";
  }
};
