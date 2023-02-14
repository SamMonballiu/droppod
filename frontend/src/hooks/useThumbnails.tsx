import { useMemo } from "react";
import { FileInfo } from "../../../models/fileinfo";
import Thumbnail from "../Thumbnail/Thumbnail";

export function useThumbnails(
  files: FileInfo[],
  onClick: (file: FileInfo) => void,
  className?: string
) {
  const { thumbnails } = useMemo(() => {
    const getThumbnail = (file: FileInfo, isSelected: boolean) => {
      return (
        <Thumbnail
          file={file}
          onClick={() => onClick(file)}
          key={files.indexOf(file).toString()}
          id={files.indexOf(file).toString()}
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
  }, [files]);

  return {
    thumbnails,
  };
}
