import React, { FC } from "react";
import { FileInfo } from "../../../models/fileinfo";
import styles from "./filelist.module.scss";
import cx from "classnames";

interface Props {
  files: FileInfo[];
  onSort: (prop: keyof FileInfo) => void;
  onSelectFile: (file: FileInfo) => void;
}

const FileList: FC<Props> = ({ files, onSort, onSelectFile }) => {
  const handleSort = (property: keyof FileInfo) => {
    return () => onSort(property);
  };

  return (
    <div className={styles.container}>
      <div className={cx(styles.file, styles.header)}>
        <p
          className={cx(styles.link, styles.filename)}
          onClick={handleSort("filename")}
        >
          Name
        </p>
        <p
          className={cx(styles.link, styles.ext)}
          onClick={handleSort("extension")}
        >
          Ext.
        </p>
        <p
          className={cx(styles.link, styles.date)}
          onClick={handleSort("dateAdded")}
        >
          Date
        </p>

        <p className={styles.size} onClick={() => handleSort("size")}>
          Size
        </p>
      </div>
      <div className={styles.files}>
        {files.map((f) => (
          <File key={f.fullPath} file={f} onSelect={onSelectFile} />
        ))}
      </div>
    </div>
  );
};

const File: FC<{ file: FileInfo; onSelect: (file: FileInfo) => void }> = ({
  file,
  onSelect,
}) => {
  return (
    <div className={styles.file} onClick={() => onSelect(file)}>
      <a target="_" className={cx(styles.link, styles.filename)}>
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
