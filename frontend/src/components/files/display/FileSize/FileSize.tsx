import React, { FC } from "react";

interface Props {
  className?: string;
  files: { size: number }[];
  format?: "kb" | "mb" | "auto";
}

const formatSize = (size: number, format: "kb" | "mb" | "auto" | "bytes") => {
  if (format === "auto") {
    format = size >= 1024 * 1024 ? "mb" : size >= 1024 ? "kb" : "bytes";
  }

  switch (format) {
    case "kb":
      return (size / 1024).toFixed(2) + "kb";
    case "mb":
      return (size / 1024 / 1024).toFixed(2) + "mb";
    case "bytes":
      return size + " bytes";
  }
};

export const FileSize: FC<Props> = ({ className, files, format = "auto" }) => {
  const totalSize = files.reduce((acc, val) => acc + val.size, 0);

  return <p className={className}>{formatSize(totalSize, format)}</p>;
};
