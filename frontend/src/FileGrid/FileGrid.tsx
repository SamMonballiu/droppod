import React, { FC, useMemo } from "react";
import { FileInfo, isImage } from "../../../models/fileinfo";
import styles from "./FileGrid.module.scss";
import { GoFile, GoFileDirectory } from "react-icons/go";
import cx from "classnames";
import { FolderInfo } from "../../../models/folderInfo";

export type FileGridZoom = 1 | 2 | 3 | 4;
interface Props {
  files: FileInfo[];
  folders: FolderInfo[];
  onSelectFile: (file: FileInfo) => void;
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
        <Folder folder={f} key={f.name} zoom={zoom} />
      ))}
      {mapped}
    </div>
  );
};

const areEqual = (first: Props, second: Props) => {
  const areDifferent =
    first.zoom !== second.zoom ||
    first.files.some((x) => second.files.indexOf(x) !== first.files.indexOf(x));

  return !areDifferent;
};
export const MemoizedGrid = React.memo(FileGrid, areEqual);

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

const Folder: FC<{ folder: FolderInfo; zoom: FileGridZoom }> = ({
  folder,
  zoom,
}) => {
  return (
    <div className={cx(styles.file, zoomMap[zoom])}>
      <div className={cx(styles.square, styles.border, thumbZoomMap[zoom])}>
        <GoFileDirectory className={styles.folderIcon} />
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
}> = ({ file, zoom, onSelect, thumbnail }) => {
  return (
    <div
      className={cx(styles.file, zoomMap[zoom])}
      onClick={() => onSelect(file)}
    >
      {isImage(file) && thumbnail ? (
        <div className={thumbZoomMap[zoom]}>{thumbnail?.element}</div>
      ) : (
        <div className={cx(styles.square, styles.border, thumbZoomMap[zoom])}>
          <GoFile className={styles.folderIcon} />
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
