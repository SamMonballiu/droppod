import React, { FC } from "react";
import { FileInfo } from "../../../models/fileinfo";
import styles from "./filelist.module.scss";
import { useSortedList } from "../hooks/useSortedList";

interface Props {
  files: FileInfo[];
}

const FileList: FC<Props> = ({ files }) => {
  const {
    getSorted,
    sortProperty,
    setSortProperty,
    isDescending,
    setIsDescending,
  } = useSortedList(files, "filename", false);

  const handleSort = (property: keyof FileInfo) => {
    if (sortProperty === property) {
      setIsDescending(!isDescending);
      return;
    }

    setSortProperty(property);
  };

  return (
    <div className={styles.container}>
      <h2>Files</h2>
      <hr />
      <div className={styles.file}>
        <p className={styles.link} onClick={() => handleSort("filename")}>
          Name
        </p>
        <p className={styles.size} onClick={() => handleSort("size")}>
          Size
        </p>
      </div>
      <div className={styles.files}>
        {getSorted().map((f) => (
          <File key={f.fullPath} file={f} />
        ))}
      </div>
    </div>
  );
};

const File: FC<{ file: FileInfo }> = ({ file }) => {
  return (
    <div className={styles.file}>
      <a target="_" href={file.fullPath} className={styles.link}>
        {file.filename}
      </a>
      <span className={styles.size}>{(file.size / 1024).toFixed(2)} kb</span>
    </div>
  );
};

export default FileList;
