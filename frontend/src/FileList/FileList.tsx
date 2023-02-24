import React, { FC } from "react";
import { FileInfo } from "../../../models/fileinfo";
import styles from "./filelist.module.scss";
import cx from "classnames";
import FileSize from "../FileSize/FileSize";
import { FolderInfo } from "../../../models/folderInfo";

interface Props {
  files: FileInfo[];
  folders: FolderInfo[];
  onSort: (prop: keyof FileInfo) => void;
  onSelectFile: (file: FileInfo) => void;
  onSelectFolder: (folder: string) => void;
}

const FileList: FC<Props> = ({
  files,
  folders,
  onSort,
  onSelectFile,
  onSelectFolder,
}) => {
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
        {folders.map((f) => (
          <Folder
            folder={f}
            key={f.name}
            onSelect={() => onSelectFolder(f.parent + "/" + f.name)}
          />
        ))}
        {files.map((f) => (
          <File key={f.fullPath} file={f} onSelect={onSelectFile} />
        ))}
      </div>
    </div>
  );
};

const Folder: FC<{ folder: FolderInfo; onSelect: () => void }> = ({
  folder,
  onSelect,
}) => {
  return (
    <div className={cx(styles.file, styles.folder)} onClick={onSelect}>
      <a target="_" className={cx(styles.link, styles.filename)}>
        {folder.name}
      </a>
    </div>
  );
};

const File: FC<{ file: FileInfo; onSelect: (file: FileInfo) => void }> = ({
  file,
  onSelect,
}) => {
  return (
    <div className={styles.file} onClick={() => onSelect(file)}>
      <a
        target="_"
        id={file.filename}
        className={cx(styles.link, styles.filename)}
      >
        {file.filename}
      </a>
      <span className={styles.ext}>{file.extension}</span>
      <span className={styles.date}>{file.dateAdded.toLocaleDateString()}</span>
      <FileSize className={styles.size} file={file} />
    </div>
  );
};

export default FileList;
