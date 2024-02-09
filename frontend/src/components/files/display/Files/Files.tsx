import cx from "classnames";
import { FC, useEffect } from "react";
import { MdModeEdit, MdSearch } from "react-icons/md";
import { SubscribableEvent } from "@models/event";
import { FileInfo, isImage } from "@models/fileinfo";
import { FolderInfo } from "@models/folderInfo";
import { View } from "../../../../App";
import { useThumbnails } from "../../../../hooks/useThumbnails";
import {
  FileGrid,
  FileGridZoom,
  FileList,
  FileContextHandler,
  MemoizedGallery,
} from "@components";
import styles from "./Files.module.scss";
import { AiOutlineClear, AiOutlineSend } from "react-icons/ai";
import { FolderContextHandler } from "@components/folders/modify/FolderContextMenu";

interface Props {
  data: FileInfo[];
  folders: FolderInfo[];
  onSelectFolder: (folder: string) => void;
  view: View;
  zoom: FileGridZoom;
  setView: (view: View) => void;
  isSelecting: boolean;
  onToggleSelected: (name: string) => void;
  onSelectedChanged: SubscribableEvent<{ element: string; selected: boolean }>;
  onSetAllSelected: SubscribableEvent<boolean>;
  onFocusFile: (file: FileInfo) => void;
  onRename: (file: FileInfo) => void;
  onRenameFolder: (folder: FolderInfo) => void;
  onMove: (file: FileInfo) => void;
  onDelete: (file: FileInfo) => void;
  onDeleteFolder: (folder: FolderInfo) => void;
}

export const Files: FC<Props> = ({
  data,
  folders,
  onSelectFolder,
  view,
  setView,
  zoom,
  isSelecting,
  onToggleSelected,
  onSelectedChanged,
  onSetAllSelected,
  onFocusFile,
  onRename,
  onRenameFolder,
  onMove,
  onDelete,
  onDeleteFolder,
}) => {
  const handleSelectedStyle = (filename: string, isSelected: boolean) => {
    const thumbnail = document.getElementById(filename)?.parentElement;
    thumbnail?.classList.toggle(
      view === "grid" ? styles.gridSelection : styles.listSelection,
      isSelected
    );
  };

  useEffect(() => {
    let unsubscribes: (() => void)[] = [];
    if (isSelecting) {
      unsubscribes.push(
        onSelectedChanged.subscribe((info) =>
          handleSelectedStyle(info.element, info.selected)
        )
      );
    }

    const className =
      view === "grid" ? styles.gridSelection : styles.listSelection;

    unsubscribes.push(
      onSetAllSelected.subscribe((value) => {
        const thumbnails = data
          .map((f) => f.filename)
          .map((fn) => document.getElementById(fn)?.parentElement);
        if (value) {
          thumbnails.forEach((thumbnail) =>
            thumbnail?.classList.add(className)
          );
        } else {
          thumbnails.forEach((thumbnail) =>
            thumbnail?.classList.remove(className)
          );
        }
      })
    );

    return () => {
      unsubscribes.forEach((unsubscribe) => unsubscribe());
    };
  }, [isSelecting, view]);

  const handleFocusFile = (file: FileInfo) => {
    if (isSelecting) {
      onToggleSelected(file.filename);
      return;
    }

    onFocusFile(file);
  };

  const { thumbnails } = useThumbnails(data, handleFocusFile);

  if (folders.length === 0 && data.length === 0) {
    return <p style={{ height: "100%" }}>This folder is empty.</p>;
  }

  const fileContextHandlers: FileContextHandler[] = [
    { label: "Show details", onClick: handleFocusFile, icon: <MdSearch /> },
    { label: "Rename", onClick: onRename, icon: <MdModeEdit /> },
    { label: "Move", onClick: onMove, icon: <AiOutlineSend /> },
    { label: "Delete", onClick: onDelete, icon: <AiOutlineClear /> },
  ];

  const folderContextHandlers: FolderContextHandler[] = [
    { label: "Rename", icon: <MdModeEdit />, onClick: onRenameFolder },
    {
      label: "Delete",
      onClick: onDeleteFolder,
      icon: <AiOutlineClear />,
    },
  ];

  return (
    <div className={styles.container}>
      {view === "gallery" && (
        <MemoizedGallery
          files={data.filter(isImage)}
          onClose={() => setView("grid")}
        />
      )}

      <div className={cx({ [styles.hidden]: view === "gallery" })}>
        {view === "list" ? (
          <FileList
            files={data}
            folders={folders}
            onSelectFile={handleFocusFile}
            onSelectFolder={onSelectFolder}
            fileContextHandlers={fileContextHandlers}
            folderContextHandlers={folderContextHandlers}
          />
        ) : (
          <FileGrid
            files={data}
            folders={folders}
            zoom={zoom}
            onSelectFile={handleFocusFile}
            onSelectFolder={onSelectFolder}
            thumbnails={thumbnails}
            fileContextHandlers={fileContextHandlers}
            folderContextHandlers={folderContextHandlers}
          />
        )}
      </div>
    </div>
  );
};
