import imageThumbnail from "image-thumbnail";
import fs from "fs";
import os from "os";

export class Format {
  public static Standard() {
    return { width: 256, height: 256 };
  }
}

export const getThumbnailPath = async (folder: string, file: string) => {
  try {
    fs.readFileSync(`${folder}.thumbs/${file}`);
  } catch {
    await generateThumbnail(folder, file, Format.Standard());
  }

  return `http://${os.hostname()}:4004/uploads/.thumbs/${file}`;
};

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
  onComplete: "save" | "return" = "save",
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

  if (onComplete === "save") {
    fs.writeFileSync(`${folder}.thumbs/${file}`, thumbnail);
  } else {
    return thumbnail;
  }
};
