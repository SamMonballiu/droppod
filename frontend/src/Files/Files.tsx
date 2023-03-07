import { FC, useEffect, useMemo, useState } from "react";
import { FileInfo, isImage } from "../../../models/fileinfo";
import FileList from "../FileList/FileList";
import FileGrid, { FileGridZoom } from "../FileGrid/FileGrid";
import { MdGridView, MdOutlineListAlt, MdOutlinePhoto } from "react-icons/md";
import { TbTelescope } from "react-icons/tb";
import styles from "./Files.module.scss";
import cx from "classnames";
import { sortBy, useSortedList } from "../hooks/useSortedList";
import FileSortOptions, { SortOption } from "./FileSortOptions";
import { FilesResponse } from "../../../models/response";
import FileDialog from "../FileDialog/FileDialog";
import { MemoizedGallery } from "../Gallery/Gallery";
import { useThumbnails } from "../hooks/useThumbnails";
import useSelectList from "../hooks/useSelectList";
import SelectionInfo from "../SelectionInfo/SelectionInfo";

interface Props {
  data: FilesResponse;
  onSelectFolder: (folder: string) => void;
}

const Files: FC<Props> = ({ data, onSelectFolder }) => {
  const [view, setView] = useState<"list" | "grid" | "gallery">("grid");
  const [zoom, setZoom] = useState<FileGridZoom>(3);
  const [focusedFile, setFocusedFile] = useState<FileInfo | null>(null);
  const [isSelecting, setIsSelecting] = useState<boolean>(false);
  const [, isSelected, toggleSelected, , setAllSelected, events] =
    useSelectList(data.contents.files.map((f) => f.filename));

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
        const thumbnails = data.contents.files
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

  const { thumbnails } = useThumbnails(data.contents.files, handleFocusFile);

  const { getSorted, sortProperty, isDescending, sort } = useSortedList(
    data.contents.files,
    "dateAdded",
    true
  );

  const sortedFolders = useMemo(() => {
    if (data.contents.folders.length === 0) {
      return [];
    }

    let sorted = data.contents.folders;

    if (sortProperty === "dateAdded") {
      sorted = [...data.contents.folders].sort((a, b) =>
        sortBy(a, b, "dateAdded")
      );
    }

    if (sortProperty === "filename") {
      sorted = [...data.contents.folders].sort((a, b) => sortBy(a, b, "name"));
    }

    return isDescending && ["dateAdded", "filename"].includes(sortProperty!)
      ? sorted.reverse()
      : sorted;
  }, [data, sortProperty, isDescending, sortBy]);

  const sortOptions: SortOption<FileInfo>[] = [
    { property: "dateAdded", name: "Date" },
    { property: "filename", name: "Filename" },
    { property: "size", name: "Size" },
    { property: "extension", name: "Extension" },
    { property: "rating", name: "Rating" },
  ];

  const handleSort = (option: SortOption<FileInfo>) => {
    sort(option.property);
  };

  if (data.contents.folders.length === 0 && data.contents.files.length === 0) {
    return <p>This folder is empty.</p>;
  }

  return (
    <div className={styles.container}>
      {isSelecting && (
        <SelectionInfo
          items={getSorted()
            .filter((f) => isSelected(f.filename))
            .map((f) => f.filename)}
          renderItem={(name: string) => <p key={name}>{name}</p>}
          onClearSelection={() => {
            setAllSelected(false);
            setIsSelecting(false);
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
          files={getSorted().filter(isImage)}
          onClose={() => setView("grid")}
        />
      )}
      <div className={styles.topBar}>
        <div
          className={cx(styles.settings, {
            [styles.hidden]: view === "gallery",
          })}
        >
          {view === "grid" ? (
            <>
              <FileSortOptions
                options={sortOptions}
                value={sortProperty!}
                onChange={(opt) => {
                  //@ts-ignore
                  handleSort(opt);
                }}
                isDescending={isDescending}
              />
              <div className={styles.zoomSlider}>
                <TbTelescope />
                <input
                  type="range"
                  min="1"
                  max="4"
                  value={zoom}
                  onChange={(e) =>
                    setZoom(parseInt(e.target.value) as FileGridZoom)
                  }
                />
              </div>
            </>
          ) : (
            <div>&nbsp;</div>
          )}

          {!isSelecting && (
            <div className={styles.icons}>
              <MdOutlineListAlt
                className={cx({ [styles.active]: view === "list" })}
                onClick={() => setView("list")}
              />
              <MdGridView
                className={cx({ [styles.active]: view === "grid" })}
                onClick={() => setView("grid")}
              />
              {data.contents.files.some(isImage) && (
                <MdOutlinePhoto
                  // @ts-ignore
                  className={cx({ [styles.active]: view === "gallery" })}
                  onClick={() => setView("gallery")}
                />
              )}
            </div>
          )}
        </div>
      </div>
      <div className={styles.content}>
        {view === "list" ? (
          <FileList
            files={getSorted()}
            folders={sortedFolders}
            onSort={sort}
            onSelectFile={handleFocusFile}
            onSelectFolder={onSelectFolder}
          />
        ) : (
          <FileGrid
            files={getSorted()}
            folders={sortedFolders}
            zoom={zoom}
            onSelectFile={handleFocusFile}
            onSelectFolder={onSelectFolder}
            thumbnails={thumbnails}
          />
        )}

        <div className={styles.info}>
          Free space: {(data.freeSpace / 1024 / 1024).toFixed(2)} mb
        </div>
      </div>
    </div>
  );
};

export default Files;
