import { FC, useMemo, useState } from "react";
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

interface Props {
  data: FilesResponse;
  onSelectFolder: (folder: string) => void;
}

const Files: FC<Props> = ({ data, onSelectFolder }) => {
  const [view, setView] = useState<"list" | "grid" | "gallery">("grid");
  const [zoom, setZoom] = useState<FileGridZoom>(3);
  const [selectedFile, setSelectedFile] = useState<FileInfo | null>(null);
  const { thumbnails } = useThumbnails(
    data.contents.files.filter((x) => !x.isFolder),
    setSelectedFile
  );

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

  const handleSelectFile = (file: FileInfo) => {
    setSelectedFile(file);
  };

  const sortOptions: SortOption<FileInfo>[] = [
    { property: "dateAdded", name: "Date" },
    { property: "filename", name: "Filename" },
    { property: "size", name: "Size" },
    { property: "extension", name: "Extension" },
  ];

  const handleSort = (option: SortOption<FileInfo>) => {
    sort(option.property);
  };

  if (data.contents.folders.length === 0 && data.contents.files.length === 0) {
    return <p>This folder is empty.</p>;
  }

  return (
    <>
      {selectedFile && (
        <FileDialog
          isOpen={selectedFile !== undefined}
          onClose={() => setSelectedFile(null)}
          file={selectedFile}
        />
      )}
      {view === "gallery" && (
        <MemoizedGallery
          files={getSorted().filter(isImage)}
          onClose={() => setView("grid")}
        />
      )}

      <div className={cx({ [styles.hidden]: view === "gallery" })}>
        <div className={styles.settings}>
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
        </div>

        {view === "list" ? (
          <FileList
            files={getSorted()}
            folders={sortedFolders}
            onSort={sort}
            onSelectFile={handleSelectFile}
            onSelectFolder={onSelectFolder}
          />
        ) : (
          <FileGrid
            files={getSorted()}
            folders={sortedFolders}
            zoom={zoom}
            onSelectFile={handleSelectFile}
            onSelectFolder={onSelectFolder}
            thumbnails={thumbnails}
          />
        )}

        <div className={styles.info}>
          Free space: {(data.freeSpace / 1024 / 1024).toFixed(2)} mb
        </div>
      </div>
    </>
  );
};

export default Files;
