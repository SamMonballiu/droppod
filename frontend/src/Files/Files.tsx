import { FC, useState } from "react";
import { FileInfo } from "../../../models/fileinfo";
import FileList from "../FileList/FileList";
import FileGrid from "../FileGrid/FileGrid";
import { MdGridView, MdOutlineListAlt } from "react-icons/md";
import styles from "./Files.module.scss";
import cx from "classnames";

interface Props {
  files: FileInfo[];
}

const Files: FC<Props> = ({ files }) => {
  const [view, setView] = useState<"list" | "grid">("grid");

  return (
    <>
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
      {view === "list" ? (
        <FileList files={files} />
      ) : (
        <FileGrid files={files} />
      )}
    </>
  );
};

export default Files;
