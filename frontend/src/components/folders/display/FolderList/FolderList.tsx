import { FC } from "react";
import { FolderInfo } from "@models/folderInfo";
import { Folder } from "@components";
import styles from "./FolderList.module.scss";
import cx from "classnames";
import { MdChevronRight, MdOutlineExpandMore } from "react-icons/md";

interface Props {
  data: FolderInfo;
  onSelect: (folder: string) => void;
  isExpanded: (folder: FolderInfo) => boolean;
  isActiveFolder: (folder: FolderInfo) => boolean;
  onToggleExpanded: (folderName: string) => void;
  className?: string;
}

export const FolderList: FC<Props> = ({
  data,
  onSelect,
  isExpanded,
  className,
  isActiveFolder,
  onToggleExpanded,
}) => {
  const byName = (first: FolderInfo, second: FolderInfo) => {
    return first.name.toLowerCase() < second.name.toLowerCase() ? -1 : 1;
  };

  const folders = data.folders.sort(byName).map((f) => {
    const fullName = f.parent + f.name;
    const canExpand = f.folders.length > 0;
    const toggleExpanded = canExpand
      ? () => onToggleExpanded(fullName)
      : undefined;

    return (
      <div key={f.name ?? "base"}>
        <div className={styles.folder}>
          {isExpanded(f) ? (
            <MdOutlineExpandMore
              className={cx(styles.icon, { [styles.invisible]: !canExpand })}
              onClick={toggleExpanded}
            />
          ) : (
            <MdChevronRight
              className={cx(styles.icon, { [styles.invisible]: !canExpand })}
              onClick={toggleExpanded}
            />
          )}
          <Folder
            variant={isActiveFolder(f) ? "open" : "closed"}
            className={styles.folder}
            folder={f}
            onSelect={() => onSelect(fullName)}
          />
        </div>

        {isExpanded(f) && (
          <div className={styles.subList}>
            <FolderList
              data={f}
              onSelect={onSelect}
              isExpanded={isExpanded}
              isActiveFolder={isActiveFolder}
              onToggleExpanded={onToggleExpanded}
            />
          </div>
        )}
      </div>
    );
  });

  return <div className={cx(className, styles.folderList)}>{folders}</div>;
};
