import cx from "classnames";
import { FC, useEffect, useState } from "react";
import { MdModeEdit, MdSearch } from "react-icons/md";
import { SubscribableEvent } from "../../../models/event";
import { FileInfo, isImage } from "../../../models/fileinfo";
import { FolderInfo } from "../../../models/folderInfo";
import { View } from "../App";
import { FileContextHandler } from "../FileContextMenu/FileContextMenu";
import FileDialog from "../FileDialog/FileDialog";
import FileGrid, { FileGridZoom } from "../FileGrid/FileGrid";
import FileList from "../FileList/FileList";
import { MemoizedGallery } from "../Gallery/Gallery";
import { useThumbnails } from "../hooks/useThumbnails";
import styles from "./Files.module.scss";

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
}

const Files: FC<Props> = ({
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
}) => {
  const [focusedFile, setFocusedFile] = useState<FileInfo | null>(null);

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

    setFocusedFile(file);
  };

  const { thumbnails } = useThumbnails(data, handleFocusFile);

  if (folders.length === 0 && data.length === 0) {
    return <p>This folder is empty.</p>;
  }

  const fileContextHandlers: FileContextHandler[] = [
    { label: "Show details", onClick: handleFocusFile, icon: <MdSearch /> },
    { label: "Rename", disabled: true, icon: <MdModeEdit /> },
  ];

  return (
    <div className={styles.container}>
      {focusedFile && (
        <FileDialog
          isOpen={focusedFile !== undefined}
          onClose={() => setFocusedFile(null)}
          file={focusedFile}
        />
      )}
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
          />
        )}
      </div>
    </div>
  );
};

export default Files;
