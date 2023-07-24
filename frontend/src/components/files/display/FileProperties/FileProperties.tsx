import { FC } from "react";
import { FileInfo } from "@models/fileinfo";
import { FileSize, Rating } from "@components";
import styles from "./FileProperties.module.scss";
import cx from "classnames";

interface Props {
  file: FileInfo;
  className?: string;
  properties?: (keyof FileInfo)[];
}

export const FileProperties: FC<Props> = ({
  file,
  className,
  properties = [
    "filename",
    "rating",
    "dateAdded",
    "dimensions",
    "size",
    "fullPath",
  ],
}) => {
  const dimensionsInfo = `${file.dimensions?.width}x${file.dimensions?.height}px`;

  const parts: Map<keyof FileInfo, React.ReactNode> = new Map<
    keyof FileInfo,
    React.ReactNode
  >([
    ["filename", <h3>{file.filename}</h3>],
    ["dateAdded", <p>{file.dateAdded.toLocaleDateString()}</p>],
    ["size", <FileSize files={[file]} />],
    ["dimensions", file.dimensions ? <p>{dimensionsInfo}</p> : <></>],
    [
      "fullPath",
      <a href={file.fullPath} target="_blank">
        link
      </a>,
    ],
    ["rating", <Rating file={file} />],
  ]);

  return (
    <div className={cx(styles.container, className)}>
      {/* @ts-ignore */}
      {properties.map((p) => ({ ...parts.get(p), key: p }))}
    </div>
  );
};
