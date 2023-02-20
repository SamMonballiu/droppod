import imageThumbnail from "image-thumbnail";
//@ts-ignore
import extractd from "extractd";
import { hasRawExtension } from "./models/fileinfo";

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
  let stream: ReadStream | null = null;
  if (hasRawExtension(file)) {
    const gen = await extractd.generate(folder + file, { stream: true });
    stream = gen.preview;
  }

  //@ts-ignore
  const thumbnail = await imageThumbnail(stream ?? folder + file, {
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
