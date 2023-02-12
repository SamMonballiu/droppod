import imageThumbnail from "image-thumbnail";
import fs from "fs";
import os from "os";

export class Format {
  public static Standard() {
    return { width: 256, height: 256 };
  }
}

export const generateThumbnail = async (
  folder: string,
  file: string,
  size:
    | {
        width: number;
        height: number;
      }
    | {
        percentage: number;
      },
  quality: number = 60
) => {
  //@ts-ignore
  const thumbnail = await imageThumbnail(folder + file, {
    fit: "cover",
    responseType: "buffer",
    jpegOptions: {
      force: true,
      quality,
    },
    withMetaData: true,
    ...size,
  });

  return thumbnail;
};
