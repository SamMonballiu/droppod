import { FC, useEffect, useState } from "react";
import { FolderInfo } from "../../../models/folderInfo";
import Breadcrumbs from "../Breadcrumbs/Breadcrumbs";
import FolderList from "../FolderList/FolderList";
import useToggle from "../hooks/useToggle";
import styles from "./FolderPicker.module.scss";

interface Props {
  data: FolderInfo;
  activeFolder: string;
  selectedFolder: string;
  onSelectFolder: (folder: string) => void;
}

const FolderPicker: FC<Props> = ({
  data,
  activeFolder,
  selectedFolder,
  onSelectFolder,
}) => {
  const [expandedFolders, setExpandedFolders] = useState<string[]>([]);
  const showFolderList = useToggle(true);

  const handleToggleExpanded = (folderName: string) => {
    if (expandedFolders.includes(folderName)) {
      setExpandedFolders(expandedFolders.filter((x) => x !== folderName));
    } else {
      setExpandedFolders([...expandedFolders, folderName]);
    }
  };

  return (
    <>
      <div className={styles.selectedFolder} onClick={showFolderList.toggle}>
        <Breadcrumbs
          path={selectedFolder}
          isReadOnly
          includeHome={activeFolder === ""}
          onClick={undefined}
        />
      </div>

      {showFolderList.value ? (
        <FolderList
          className={styles.folderList}
          data={data}
          onSelect={(folder) => {
            onSelectFolder("/" + folder);
            showFolderList.toggle();
          }}
          isExpanded={(folder) =>
            expandedFolders.includes(folder.parent + folder.name)
          }
          isActiveFolder={(folder) =>
            selectedFolder === `/${folder.parent}${folder.name}`
          }
          onToggleExpanded={handleToggleExpanded}
        />
      ) : null}
    </>
  );
};

export default FolderPicker;
