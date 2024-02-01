import React, { FC } from "react";

interface Props {
  className?: string;
  files: { size: number }[];
  format?: "kb" | "mb" | "auto";
}

export function formatBytes(bytes: number, decimals = 2) {
  if (!+bytes) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export const FileSize: FC<Props> = ({ className, files, format = "auto" }) => {
  const totalSize = files.reduce((acc, val) => acc + val.size, 0);

  return <p className={className}>{formatBytes(totalSize)}</p>;
};
