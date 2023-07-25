import React, { FC, useMemo } from "react";
import { FileInfo, hasRawExtension, isImage } from "@models/fileinfo";
import styles from "./FileGrid.module.scss";
import { GoFile } from "react-icons/go";
import cx from "classnames";
import { FolderInfo } from "@models/folderInfo";
import { FcFolder } from "react-icons/fc";
import { FileContextMenu, FileContextHandler, Rating } from "@components";
import { FileIcon } from "@components/files/display/FileTypeIcon/FileTypeIcon";
import {
  FolderContextHandler,
  FolderContextMenu,
} from "@components/folders/modify/FolderContextMenu";

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
  fileContextHandlers: FileContextHandler[];
  folderContextHandlers: FolderContextHandler[];
}

export const FileGrid: FC<Props> = ({
  files,
  folders,
  onSelectFile,
  onSelectFolder,
  thumbnails,
  zoom = 2,
  fileContextHandlers,
  folderContextHandlers,
}) => {
  const mapped = useMemo(() => {
    return files.map((file) => (
      <File
        key={file.filename}
        file={file}
        zoom={zoom}
        onSelect={onSelectFile}
        thumbnail={thumbnails.find((t) => t.file === file)}
        contextHandlers={fileContextHandlers}
      />
    ));
  }, [files]);

  return (
    <div className={styles.container}>
      {folders.map((f) => (
        <Folder
          contextHandlers={folderContextHandlers}
          folder={f}
          key={f.name}
          zoom={zoom}
          onSelect={() =>
            onSelectFolder(f.parent === "" ? f.name : f.parent + "/" + f.name)
          }
        />
      ))}
      {mapped}
    </div>
  );
};

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
  contextHandlers: FolderContextHandler[];
}> = ({ folder, zoom, onSelect, contextHandlers }) => {
  return (
    <FolderContextMenu folder={folder} handlers={contextHandlers}>
      <div className={cx(styles.file, zoomMap[zoom])} onClick={onSelect}>
        <div className={cx(styles.square, styles.border, thumbZoomMap[zoom])}>
          <FcFolder
            className={styles.folderIcon}
            id={folder.parent + "/" + folder.name}
          />
        </div>

        {zoom > 1 && <Name name={folder.name} className={zoomMap[zoom]} />}
      </div>
    </FolderContextMenu>
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
  contextHandlers: FileContextHandler[];
}> = ({ file, zoom, onSelect, thumbnail, isSelected, contextHandlers }) => {
  const rating = file.rating ? (
    <Rating file={file} readonly noHollowStars className={styles.rating} />
  ) : null;

  return (
    <div
      className={cx(styles.file, zoomMap[zoom])}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(file);
      }}
    >
      <FileContextMenu file={file} handlers={contextHandlers}>
        {(isImage(file) || hasRawExtension(file.filename)) && thumbnail ? (
          <div
            className={cx(thumbZoomMap[zoom], {
              [styles.selected]: isSelected,
            })}
          >
            {rating}
            {thumbnail?.element}
          </div>
        ) : (
          <div
            className={cx(styles.square, styles.border, thumbZoomMap[zoom], {
              [styles.selected]: isSelected,
            })}
          >
            {rating}
            <FileIcon
              file={file}
              className={styles.folderIcon}
              id={file.filename}
            />
            {/* <GoFile className={styles.folderIcon} id={file.filename} /> */}
          </div>
        )}
      </FileContextMenu>

      {zoom > 1 && <Name name={file.filename} className={zoomMap[zoom]} />}
    </div>
  );
};

const Name: FC<{ name: string; className: string }> = ({ name, className }) => {
  return (
    <span title={name} className={cx(styles.filename, className)}>
      {name}
    </span>
  );
};
