import { FC, useState } from "react";
import { FileInfo } from "../../../models/fileinfo";
import FileList from "../FileList/FileList";
import FileGrid from "../FileGrid/FileGrid";
import { MdGridView, MdOutlineListAlt } from "react-icons/md";
import styles from "./Files.module.scss";
import cx from "classnames";
import { useSortedList } from "../hooks/useSortedList";
import FileSortOptions, { SortOption } from "./FileSortOptions";
import { FilesResponse } from "../../../models/response";

interface Props {
  data: FilesResponse;
}

const Files: FC<Props> = ({ data }) => {
  const [view, setView] = useState<"list" | "grid">("grid");

  const {
    getSorted,
    sortProperty,
    setSortProperty,
    isDescending,
    setIsDescending,
  } = useSortedList(data.files, "dateAdded", true);

  const sortOptions: SortOption<FileInfo>[] = [
    { property: "dateAdded", name: "Date" },
    { property: "filename", name: "Filename" },
    { property: "size", name: "Size" },
    { property: "extension", name: "Extension" },
  ];

  const handleSort = (option: SortOption<FileInfo>) => {
    if (sortProperty === option.property) {
      setIsDescending(!isDescending);
      return;
    }

    setSortProperty(option.property);
    setIsDescending(false);
  };

  return (
    <>
      <div className={styles.settings}>
        {view === "grid" ? (
          <FileSortOptions
            options={sortOptions}
            value={sortProperty!}
            onChange={(opt) => {
              //@ts-ignore
              handleSort(opt);
            }}
            isDescending={isDescending}
          />
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
        </div>
      </div>

      {view === "list" ? (
        <FileList files={data.files} />
      ) : (
        <FileGrid files={getSorted()} />
      )}

      <div className={styles.info}>
        Free space: {(data.freeSpace / 1024 / 1024).toFixed(2)} mb
      </div>
    </>
  );
};

export default Files;
