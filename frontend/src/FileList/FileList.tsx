import React, { FC } from "react";
import { FileInfo } from "../../../models/fileinfo";
import styles from "./filelist.module.scss";
import { useSortedList } from "../hooks/useSortedList";
import cx from "classnames";

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
      <div className={cx(styles.file, styles.header)}>
        <p
          className={cx(styles.link, styles.filename)}
          onClick={() => handleSort("filename")}
        >
          Name
        </p>
        <p
          className={cx(styles.link, styles.ext)}
          onClick={() => handleSort("extension")}
        >
          Ext.
        </p>
        <p
          className={cx(styles.link, styles.date)}
          onClick={() => handleSort("dateAdded")}
        >
          Date
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
      <a
        target="_"
        href={file.fullPath}
        className={cx(styles.link, styles.filename)}
      >
        {file.filename}
      </a>
      <span className={styles.ext}>{file.extension}</span>
      <span className={styles.date}>
        {new Date(file.dateAdded).toLocaleDateString()}
      </span>
      <span className={styles.size}>{(file.size / 1024).toFixed(2)} kb</span>
    </div>
  );
};

export default FileList;
