export interface FileInfo {
  filename: string;
  fullPath: string;
  extension: string;
  size: number;
  thumbnailPath: any;
}

export const isImageExtension = (ext: string) =>
  [".jpeg", ".jpg", ".png", ".bmp", ".tif", ".tiff", ".gif"].includes(
    ext.toLowerCase()
  );

export const isImage = (file: FileInfo) => isImageExtension(file.extension);
