import { FC, useState } from "react";
import { FileInfo, isImage } from "../../../models/fileinfo";
import FileList from "../FileList/FileList";
import FileGrid, { FileGridZoom } from "../FileGrid/FileGrid";
import { MdGridView, MdOutlineListAlt, MdOutlinePhoto } from "react-icons/md";
import { TbTelescope } from "react-icons/tb";
import styles from "./Files.module.scss";
import cx from "classnames";
import { useSortedList } from "../hooks/useSortedList";
import FileSortOptions, { SortOption } from "./FileSortOptions";
import { FilesResponse } from "../../../models/response";
import FileDialog from "../FileDialog/FileDialog";
import Gallery from "../Gallery/Gallery";

interface Props {
  data: FilesResponse;
}

const Files: FC<Props> = ({ data }) => {
  const [view, setView] = useState<"list" | "grid" | "gallery">("grid");
  const [zoom, setZoom] = useState<FileGridZoom>(3);
  const [selectedFile, setSelectedFile] = useState<FileInfo | null>(null);

  const { getSorted, sortProperty, isDescending, sort } = useSortedList(
    data.files,
    "dateAdded",
    true
  );

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

  if (view === "gallery") {
    return (
      <Gallery
        files={getSorted().filter(isImage)}
        onClose={() => setView("grid")}
      />
    );
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
          <MdOutlinePhoto
            // @ts-ignore
            className={cx({ [styles.active]: view === "gallery" })}
            onClick={() => setView("gallery")}
          />
        </div>
      </div>

      {view === "list" ? (
        <FileList
          files={getSorted()}
          onSort={sort}
          onSelectFile={handleSelectFile}
        />
      ) : (
        <FileGrid
          files={getSorted()}
          zoom={zoom}
          onSelectFile={handleSelectFile}
        />
      )}

      <div className={styles.info}>
        Free space: {(data.freeSpace / 1024 / 1024).toFixed(2)} mb
      </div>
    </>
  );
};

export default Files;
