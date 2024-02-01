import { FileInfo, FileType, is } from "@models/fileinfo";
import { FC } from "react";

interface Props {
  file: FileInfo;
  className?: string;
  controls?: boolean;
  autoPlay?: boolean;
}

export const MediaPreview: FC<Props> = ({ file, className, ...mediaProps }) => {
  const path = `${window.location.protocol}//${window.location.host.replace(
    "5173",
    "4004"
  )}${file.fullPath}`;
  if (is(file, FileType.Audio)) {
    return <audio src={path} className={className} {...mediaProps} />;
  }

  return <video src={path} className={className} {...mediaProps} />;
};
