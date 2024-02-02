import { config } from "@config";
import { ratings } from "../ratings";
import http from "http";
import { FilesResponse, GoFilesResponse } from "../models/response";

const crawl = async (
  folderName: string,
  onSuccess: (response: FilesResponse) => void,
  onError: (message: string) => void
) => {
  http.get(
    `${config.goBaseUrl}/list?path=${encodeURIComponent(
      folderName
    )}&basePath=${encodeURIComponent(config.basePath)}`,
    (result) => {
      let data = "";
      result.on("data", (chunk) => {
        data += chunk;
      });

      result.on("end", () => {
        try {
          let parsed: GoFilesResponse;
          parsed = JSON.parse(data);

          if (!parsed.isSuccess) {
            onError(parsed.error);
            return;
          }

          const files = parsed.response!.contents.files ?? [];
          if (files.length > 0) {
            const rated = [];

            for (const file of files) {
              ratings.get(file.fullPath).then((result) => {
                file.rating = result;
                rated.push(file);
                if (rated.length === files.length) {
                  onSuccess(parsed.response!);
                }
              });
            }
          } else {
            onSuccess(parsed.response!);
          }
        } catch (err) {
          throw err;
        }
      });
    }
  );
};

interface Args {
  path: string;
  onSuccess: (response: FilesResponse) => void;
  onError: (message: string) => void;
}
export const mapFolder = async ({ path, onSuccess, onError }: Args) => {
  return await crawl(path, onSuccess, onError);
};
