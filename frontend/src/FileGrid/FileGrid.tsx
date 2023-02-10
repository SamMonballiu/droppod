import { FC } from "react";
import { FileInfo, isImage } from "../../../models/fileinfo";
import styles from "./FileGrid.module.scss";
import { GoFile } from "react-icons/go";
import cx from "classnames";
import ImagePreview from "../ImagePreview.tsx/ImagePreview";

export type FileGridZoom = 1 | 2 | 3 | 4;
interface Props {
  files: FileInfo[];
  onSelectFile: (file: FileInfo) => void;
  zoom?: FileGridZoom;
}

const FileGrid: FC<Props> = ({ files, onSelectFile, zoom = 2 }) => {
  return (
    <div className={styles.container}>
      {files.map((file) => (
        <File
          key={file.filename}
          file={file}
          zoom={zoom}
          onSelect={onSelectFile}
        />
      ))}
    </div>
  );
};

export default FileGrid;

const File: FC<{
  file: FileInfo;
  zoom: FileGridZoom;
  onSelect: (file: FileInfo) => void;
}> = ({ file, zoom, onSelect }) => {
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

  return (
    <div
      className={cx(styles.file, zoomMap[zoom])}
      onClick={() => onSelect(file)}
    >
      {isImage(file) ? (
        <ImagePreview
          file={file}
          square
          dimension={300}
          className={thumbZoomMap[zoom]}
        />
      ) : (
        <div className={cx(styles.square, styles.border, thumbZoomMap[zoom])}>
          <GoFile className={styles.folderIcon} />
        </div>
      )}

      <a
        target="_"
        href={file.fullPath}
        className={cx(styles.filename, zoomMap[zoom])}
      >
        {file.filename}
      </a>
    </div>
  );
};
