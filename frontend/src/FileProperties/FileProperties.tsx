import { FC } from "react";
import { FileInfo, FileInfo as FileProperties } from "../../../models/fileinfo";
import FileSize from "../FileSize/FileSize";
import styles from "./FileProperties.module.scss";
import cx from "classnames";

interface Props {
  file: FileProperties;
  className?: string;
  properties?: (keyof FileInfo)[];
}
const FileProperties: FC<Props> = ({
  file,
  className,
  properties = ["filename", "dateAdded", "dimensions", "size", "fullPath"],
}) => {
  const dimensionsInfo = `${file.dimensions?.width}x${file.dimensions?.height}px`;

  const parts: Map<keyof FileInfo, React.ReactNode> = new Map<
    keyof FileInfo,
    React.ReactNode
  >([
    ["filename", <h3>{file.filename}</h3>],
    ["dateAdded", <p>{file.dateAdded.toLocaleDateString()}</p>],
    ["size", <FileSize file={file} />],
    ["dimensions", file.dimensions ? <p>{dimensionsInfo}</p> : <></>],
    [
      "fullPath",
      <a href={file.fullPath} target="_blank">
        link
      </a>,
    ],
  ]);

  return (
    <div className={cx(styles.container, className)}>
      {/* @ts-ignore */}
      {properties.map((p) => ({ ...parts.get(p), key: p }))}
    </div>
  );
};

export default FileProperties;
