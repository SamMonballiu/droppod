export interface FileInfo {
  filename: string;
  fullPath: string;
  extension: string;
  size: number;
}

export const isImage = (file: FileInfo) =>
  [".jpeg", ".jpg", ".png", ".bmp", ".tif", ".tiff"].includes(
    file.extension.toLowerCase()
  );
