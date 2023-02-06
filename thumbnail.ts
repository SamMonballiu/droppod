import imageThumbnail from "image-thumbnail";
import fs from "fs";
import os from "os";

export const getThumbnailPath = async (folder: string, file: string) => {
  try {
    fs.readFileSync(`${folder}.thumbs/${file}`);
  } catch {
    await generateThumbnail(folder, file);
  }

  return `http://${os.hostname()}:4004/uploads/.thumbs/${file}`;
};
export const generateThumbnail = async (folder: string, file: string) => {
  //@ts-ignore
  const thumbnail = await imageThumbnail(folder + file, {
    width: 256,
    height: 256,
    fit: "cover",
    responseType: "buffer",
    jpegOptions: {
      force: true,
      quality: 60,
    },
    withMetaData: true,
  });

  fs.writeFileSync(`${folder}.thumbs/${file}`, thumbnail);
};
