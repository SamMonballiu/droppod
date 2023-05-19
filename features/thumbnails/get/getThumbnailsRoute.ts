import { Express, Request, Response } from "express";
import { ThumbnailCache } from "../../../thumbnail-cache";
import { config } from "@config";
import { generateThumbnail } from "../../../thumbnail";

export const mapGetThumbnailsRoute = (app: Express, cache: ThumbnailCache) => {
  app.get("/thumbnail", async (req: Request, res: Response) => {
    const file = req.query.file as string;
    if (!req.query.size && !req.query.percentage) {
      res.status(400).send("Must supply either a size or a percentage.");
    }

    let size = null;
    if (req.query.size) {
      const [height, width] = (req.query.size as string)
        .split("x")
        .map((d) => parseInt(d));

      size = { height, width };
    }

    let percentage = 0;
    if (req.query.percentage) {
      percentage = parseInt(req.query.percentage as string);
    }

    const quality = req.query.quality
      ? parseInt(req.query.quality as string)
      : 60;

    let thumbnail: Buffer;
    if (cache.has(file, req.query.size as string, quality)) {
      thumbnail = cache.get(file, req.query.size as string, quality)!;
    } else {
      try {
        thumbnail = await generateThumbnail(
          config.basePath,
          file,
          size ?? { percentage },
          quality
        );

        cache.add(file, req.query.size as string, quality, thumbnail);
      } catch (err) {
        console.log(err);
        thumbnail = Buffer.from([]);
      }
    }

    res.setHeader("content-type", "image/jpeg").status(200).send(thumbnail);
  });
};
