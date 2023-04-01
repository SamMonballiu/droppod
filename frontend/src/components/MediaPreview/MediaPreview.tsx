import { FileInfo, FileType, is } from "@models/fileinfo";
import { FC } from "react";

interface Props {
  file: FileInfo;
  className?: string;
  controls?: boolean;
  autoPlay?: boolean;
}

export const MediaPreview: FC<Props> = ({ file, className, ...mediaProps }) => {
  if (is(file, FileType.Audio)) {
    return <audio src={file.fullPath} className={className} {...mediaProps} />;
  }

  return <video src={file.fullPath} className={className} {...mediaProps} />;
};
