import { config } from "@config";
import { ratings } from "../ratings";
import http from "http";
import { FilesResponse } from "../models/response";

const crawl = async (
  folderName: string,
  onComplete: (response: FilesResponse) => void
) => {
  http.get(
    `${config.goBaseUrl}/list?path=${folderName}&basePath=${config.basePath}`,
    (result) => {
      let data = "";
      result.on("data", (chunk) => {
        data += chunk;
      });

      result.on("end", () => {
        let parsed: FilesResponse;
        parsed = JSON.parse(data);

        // checkDiskSpace(fullFolder).then((result) => {
        // parsed.freeSpace = result.free;

        const files = parsed.contents.files ?? [];
        const rated = [];
        for (const file of files) {
          ratings.get(file.fullPath).then((result) => {
            file.rating = result;
            rated.push(file);
            if (rated.length === files.length) {
              onComplete(parsed);
            }
          });
        }
        // });
      });
    }
  );
};

export const folderMapper = (folderName: string) => {
  return {
    onComplete: (callback: (response: FilesResponse) => void) => ({
      start: async () => {
        await crawl(folderName, callback);
      },
    }),
  };
};
