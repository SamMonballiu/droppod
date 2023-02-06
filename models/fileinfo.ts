export interface FileInfo {
  filename: string;
  fullPath: string;
  extension: string;
  size: number;
  thumbnailPath: string | undefined;
}

export const isImageExtension = (ext: string) =>
  [".jpeg", ".jpg", ".png", ".bmp", ".tif", ".tiff", ".gif"].includes(
    ext.toLowerCase()
  );

export const isImage = (file: FileInfo) => isImageExtension(file.extension);
