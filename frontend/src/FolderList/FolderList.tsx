import { FC } from "react";
import { FolderInfo } from "../../../models/folderInfo";
import { Folder } from "../FileList/FileList";
import styles from "./FolderList.module.scss";

interface Props {
  data: FolderInfo;
  activeFolder: string;
  onSelect: (folder: string) => void;
  isExpanded: (folder: string) => boolean;
}

const FolderList: FC<Props> = ({
  data,
  activeFolder,
  onSelect,
  isExpanded,
}) => {
  const folders = data.folders.map((f) => (
    <div key={f.name ?? "base"}>
      <Folder
        variant={activeFolder.includes(f.name) ? "open" : "closed"}
        truncate={20}
        className={styles.folder}
        folder={f}
        onSelect={() => onSelect(f.parent + f.name)}
      />

      {isExpanded(f.name) && (
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

  return <div className={styles.folderList}>{folders}</div>;
};
export default FolderList;
