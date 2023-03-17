import { FC } from "react";
import { FolderInfo } from "../../../models/folderInfo";
import { Folder } from "../FileList/FileList";
import styles from "./FolderList.module.scss";
import cx from "classnames";

interface Props {
  data: FolderInfo;
  activeFolder: string;
  onSelect: (folder: string) => void;
  isExpanded: (folder: FolderInfo) => boolean;
  className?: string;
}

const FolderList: FC<Props> = ({
  data,
  activeFolder,
  onSelect,
  isExpanded,
  className,
}) => {
  const folders = data.folders.map((f) => (
    <div key={f.name ?? "base"}>
      <Folder
        variant={activeFolder.includes(f.name) ? "open" : "closed"}
        className={styles.folder}
        folder={f}
        onSelect={() => onSelect(f.parent + f.name)}
      />

      {isExpanded(f) && (
        <div className={styles.subList}>
          <FolderList
            data={f}
            activeFolder={activeFolder}
            onSelect={onSelect}
            isExpanded={isExpanded}
          />
        </div>
      )}
    </div>
  ));

  return <div className={cx(className, styles.folderList)}>{folders}</div>;
};
export default FolderList;
