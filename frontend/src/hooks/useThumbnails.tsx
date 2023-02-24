import { useMemo } from "react";
import { FileInfo } from "../../../models/fileinfo";
import { FilesResponse } from "../../../models/response";
import Thumbnail from "../Thumbnail/Thumbnail";

export function useThumbnails(
  allFiles: FileInfo[],
  onClick: (file: FileInfo) => void,
  className?: string
) {
  const { thumbnails } = useMemo(() => {
    const files = allFiles.filter((x) => !x.isFolder);
    const getThumbnail = (file: FileInfo) => {
      return (
        <Thumbnail
          file={file}
          onClick={() => onClick(file)}
          key={files.indexOf(file).toString()}
          id={file.filename}
          className={className}
        />
      );
    };

    const thumbnails = files.map((f) => {
      return {
        file: f,
        element: getThumbnail(f, false),
      };
    });

    return { getThumbnail, thumbnails };
  }, [allFiles]);

  return {
    thumbnails,
  };
}
