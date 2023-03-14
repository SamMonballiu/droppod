import cx from "classnames";
import { FC, useEffect, useState } from "react";
import { FileInfo, isImage } from "../../../models/fileinfo";
import { FolderInfo } from "../../../models/folderInfo";
import { View } from "../App";
import FileDialog from "../FileDialog/FileDialog";
import FileGrid, { FileGridZoom } from "../FileGrid/FileGrid";
import FileList from "../FileList/FileList";
import { MemoizedGallery } from "../Gallery/Gallery";
import useSelectList from "../hooks/useSelectList";
import { useThumbnails } from "../hooks/useThumbnails";
import SelectionInfo from "../SelectionInfo/SelectionInfo";
import styles from "./Files.module.scss";

interface Props {
  data: FileInfo[];
  folders: FolderInfo[];
  onSelectFolder: (folder: string) => void;
  view: View;
  zoom: FileGridZoom;
  setView: (view: View) => void;
  isSelecting: boolean;
}

const Files: FC<Props> = ({
  data,
  folders,
  onSelectFolder,
  view,
  setView,
  zoom,
  isSelecting,
}) => {
  const [focusedFile, setFocusedFile] = useState<FileInfo | null>(null);

  const [, isSelected, toggleSelected, , setAllSelected, events] =
    useSelectList(data.map((f) => f.filename));

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
        events.onSelectedChanged.subscribe((info) =>
          handleSelectedStyle(info.element, info.selected)
        )
      );
    }

    const className =
      view === "grid" ? styles.gridSelection : styles.listSelection;

    unsubscribes.push(
      events.onSetAllSelected.subscribe((value) => {
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
      unsubscribes.forEach((fn) => fn());
    };
  }, [isSelecting, view]);

  const handleFocusFile = (file: FileInfo) => {
    if (isSelecting) {
      toggleSelected(file.filename);
      return;
    }

    setFocusedFile(file);
  };

  const { thumbnails } = useThumbnails(data, handleFocusFile);

  if (folders.length === 0 && data.length === 0) {
    return <p>This folder is empty.</p>;
  }

  return (
    <div className={styles.container}>
      {isSelecting && (
        <SelectionInfo
          items={data
            .filter((f) => isSelected(f.filename))
            .map((f) => f.filename)}
          renderItem={(name: string) => <p key={name}>{name}</p>}
          onClearSelection={() => {
            setAllSelected(false);
            //setIsSelecting(false);
          }}
          onSelectAll={() => {
            setAllSelected(true);
          }}
        />
      )}

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
          />
        ) : (
          <FileGrid
            files={data}
            folders={folders}
            zoom={zoom}
            onSelectFile={handleFocusFile}
            onSelectFolder={onSelectFolder}
            thumbnails={thumbnails}
          />
        )}
      </div>
    </div>
  );
};

export default Files;
