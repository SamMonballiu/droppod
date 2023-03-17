import React, { FC } from "react";
import { FileInfo, isImage } from "../../../models/fileinfo";
import styles from "./filelist.module.scss";
import cx from "classnames";
import FileSize from "../FileSize/FileSize";
import { FolderInfo } from "../../../models/folderInfo";
import { GoFile, GoFileMedia } from "react-icons/go";
import { FcFolder, FcOpenedFolder } from "react-icons/fc";
import Rating from "../Rating/Rating";

interface Props {
  files: FileInfo[];
  folders: FolderInfo[];
  onSelectFile: (file: FileInfo) => void;
  onSelectFolder: (folder: string) => void;
}

const FileList: FC<Props> = ({
  files,
  folders,
  onSelectFile,
  onSelectFolder,
}) => {
  return (
    <div className={styles.container}>
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

export const Folder: FC<{
  className?: string;
  folder: FolderInfo;
  onSelect: () => void;
  variant?: "open" | "closed";
}> = ({ folder, onSelect, variant = "closed", className }) => {
  return (
    <div className={cx(styles.file, styles.folder)} onClick={onSelect}>
      <a target="_" className={cx(styles.link, styles.filename, className)}>
        {variant === "closed" ? <FcFolder /> : <FcOpenedFolder />}
        <span>{folder.name}</span>
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
        {isImage(file) ? <GoFileMedia /> : <GoFile />}
        {file.filename}
      </a>
      <span className={styles.ext}>{file.extension}</span>
      <span className={styles.date}>{file.dateAdded.toLocaleDateString()}</span>
      <span className={styles.rating}>
        {file.rating ? <Rating file={file} readonly /> : null}
      </span>
      <FileSize className={styles.size} file={file} />
    </div>
  );
};

export default FileList;
