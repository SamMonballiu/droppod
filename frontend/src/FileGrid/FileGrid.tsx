import { FC } from "react";
import { FileInfo, isImage } from "../../../models/fileinfo";
import styles from "./FileGrid.module.scss";

interface Props {
  files: FileInfo[];
}

const FileGrid: FC<Props> = ({ files }) => {
  return (
    <div className={styles.container}>
      {files.map((file) => (
        <File key={file.filename} file={file} />
      ))}
    </div>
  );
};

export default FileGrid;

const File: FC<{ file: FileInfo }> = ({ file }) => {
  return (
    <div className={styles.file}>
      {isImage(file) ? (
        <img src={file.fullPath} />
      ) : (
        <div className={styles.thumbnail}></div>
      )}

      <a target="_" href={file.fullPath} className={styles.filename}>
        {file.filename}
      </a>
    </div>
  );
};
