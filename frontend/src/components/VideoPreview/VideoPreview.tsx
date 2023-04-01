import { FileInfo } from "@models/fileinfo";
import { FC } from "react";

interface Props {
  file: FileInfo;
  className?: string;
  controls?: boolean;
  autoPlay?: boolean;
}

export const VideoPreview: FC<Props> = ({ file, className, ...videoProps }) => {
  return <video src={file.fullPath} className={className} {...videoProps} />;
};
