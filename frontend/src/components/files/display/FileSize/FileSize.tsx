import { FileInfo, getSize } from "@models/fileinfo";
import React, { FC } from "react";

interface Props {
  className?: string;
  file: FileInfo;
  format?: "kb" | "mb" | "auto";
}

export const FileSize: FC<Props> = ({ className, file, format = "auto" }) => {
  return <p className={className}>{getSize(file, format)}</p>;
};
