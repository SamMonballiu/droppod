import React, { FC, useMemo } from "react";
import { FileInfo, hasRawExtension, isImage } from "../../../models/fileinfo";
import styles from "./FileGrid.module.scss";
import { GoFile } from "react-icons/go";
import cx from "classnames";
import { FolderInfo } from "../../../models/folderInfo";
import { FcFolder } from "react-icons/fc";

export type FileGridZoom = 1 | 2 | 3 | 4;
interface Props {
  files: FileInfo[];
  folders: FolderInfo[];
  onSelectFile: (file: FileInfo) => void;
  onSelectFolder: (folder: string) => void;
  zoom?: FileGridZoom;
  thumbnails: {
    file: FileInfo;
    element: React.ReactNode;
  }[];
}

const FileGrid: FC<Props> = ({
  files,
  folders,
  onSelectFile,
  onSelectFolder,
  thumbnails,
  zoom = 2,
}) => {
  const mapped = useMemo(() => {
    return files.map((file) => (
      <File
        key={file.filename}
        file={file}
        zoom={zoom}
        onSelect={onSelectFile}
        thumbnail={thumbnails.find((t) => t.file === file)}
      />
    ));
  }, [files]);

  return (
    <div className={styles.container}>
      {folders.map((f) => (
        <Folder
          folder={f}
          key={f.name}
          zoom={zoom}
          onSelect={() => onSelectFolder(f.parent + "/" + f.name)}
        />
      ))}
      {mapped}
    </div>
  );
};

export default FileGrid;

const zoomMap: Record<FileGridZoom, string> = {
  1: styles.zoom1,
  2: styles.zoom2,
  3: styles.zoom3,
  4: styles.zoom4,
};

const thumbZoomMap: Record<FileGridZoom, string> = {
  1: styles.thumbZoom1,
  2: styles.thumbZoom2,
  3: styles.thumbZoom3,
  4: styles.thumbZoom4,
};

const Folder: FC<{
  folder: FolderInfo;
  zoom: FileGridZoom;
  onSelect: () => void;
}> = ({ folder, zoom, onSelect }) => {
  return (
    <div className={cx(styles.file, zoomMap[zoom])} onClick={onSelect}>
      <div className={cx(styles.square, styles.border, thumbZoomMap[zoom])}>
        <FcFolder className={styles.folderIcon} />
      </div>

      {zoom > 1 && (
        <span className={cx(styles.filename, zoomMap[zoom])}>
          {folder.name}
        </span>
      )}
    </div>
  );
};

const File: FC<{
  file: FileInfo;
  zoom: FileGridZoom;
  onSelect: (file: FileInfo) => void;
  thumbnail?: {
    file: FileInfo;
    element: React.ReactNode;
  };
  isSelected?: boolean;
}> = ({ file, zoom, onSelect, thumbnail, isSelected }) => {
  return (
    <div
      className={cx(styles.file, zoomMap[zoom])}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(file);
      }}
    >
      {(isImage(file) || hasRawExtension(file.filename)) && thumbnail ? (
        <div
          className={cx(thumbZoomMap[zoom], { [styles.selected]: isSelected })}
        >
          {thumbnail?.element}
        </div>
      ) : (
        <div
          className={cx(styles.square, styles.border, thumbZoomMap[zoom], {
            [styles.selected]: isSelected,
          })}
        >
          <GoFile className={styles.folderIcon} id={file.filename} />
        </div>
      )}

      {zoom > 1 && (
        <span className={cx(styles.filename, zoomMap[zoom])}>
          {file.filename}
        </span>
      )}
    </div>
  );
};
