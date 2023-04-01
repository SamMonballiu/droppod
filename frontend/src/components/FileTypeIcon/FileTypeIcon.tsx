import { FileInfo, FileType, getType } from "@models/fileinfo";
import React, { FC } from "react";
import {
  FcAudioFile,
  FcDocument,
  FcFile,
  FcImageFile,
  FcVideoFile,
} from "react-icons/fc";

interface Props {
  file: FileInfo;
  className?: string;
  id?: string;
}

export const FileIcon: FC<Props> = ({ file, className, id }) => {
  const typesMap = new Map<FileType, React.ReactNode>([
    [FileType.Audio, <FcAudioFile className={className} id={id} />],
    [FileType.Image, <FcImageFile className={className} id={id} />],
    [FileType.Text, <FcDocument className={className} id={id} />],
    [FileType.Video, <FcVideoFile className={className} id={id} />],
    [FileType.Unknown, <FcFile className={className} id={id} />],
  ]);

  const type = getType(file);

  if (typesMap.has(type)) {
    return typesMap.get(type);
  }

  return <FcFile />;
};
