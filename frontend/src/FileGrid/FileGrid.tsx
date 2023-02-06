import { FC } from "react";
import { FileInfo, isImage } from "../../../models/fileinfo";
import styles from "./FileGrid.module.scss";
import { GoFile } from "react-icons/go";

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
        <img src={file.thumbnailPath} />
      ) : (
        <div className={styles.square}>
          <GoFile className={styles.folderIcon} />
        </div>
      )}

      <a target="_" href={file.fullPath} className={styles.filename}>
        {file.filename}
      </a>
    </div>
  );
};
