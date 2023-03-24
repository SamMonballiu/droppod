import { FC, useState } from "react";
import { GoChevronDown, GoChevronRight } from "react-icons/go";
import { FolderInfo } from "../../../models/folderInfo";
import Breadcrumbs from "../Breadcrumbs/Breadcrumbs";
import Dialog, { DialogProps } from "../Dialog/Dialog";
import FolderPicker from "../FolderPicker/FolderPicker";
import useToggle from "../hooks/useToggle";
import styles from "./MoveFilesDialog.module.scss";

interface Props extends Omit<DialogProps, "title" | "children"> {
  data: FolderInfo;
  activeFolder: string;
  files: string[];
  onConfirm: (destination: string) => void;
  isMoving: boolean;
}

const MoveFilesDialog: FC<Props> = ({
  isOpen,
  onClose,
  data,
  activeFolder,
  files,
  onConfirm,
  isMoving = false,
}) => {
  const showFiles = useToggle(true);
  const [destination, setDestination] = useState(activeFolder);
  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Move files"
      buttons={[
        {
          label: "Move",
          className: styles.move,
          onClick: () => onConfirm(destination),
          disabled: isMoving || destination === activeFolder,
        },
      ]}
    >
      <div className={styles.dialog}>
        <div className={styles.from}>
          <label>From:</label>
          <Breadcrumbs
            path={activeFolder}
            isReadOnly
            onClick={undefined}
            includeHome={activeFolder === ""}
          />
        </div>
        <div className={styles.to}>
          <label>To:</label>
          <div>
            <FolderPicker
              data={data}
              activeFolder={activeFolder}
              selectedFolder={destination}
              onSelectFolder={setDestination}
            />
          </div>
        </div>
        <div className={styles.filesHeader} onClick={showFiles.toggle}>
          {showFiles.value ? <GoChevronDown /> : <GoChevronRight />}
          <h4>Files ({files.length})</h4>
        </div>
        {showFiles.value ? (
          <div className={styles.files}>
            {files.map((f) => (
              <p key={f}>{f}</p>
            ))}
          </div>
        ) : null}
      </div>
    </Dialog>
  );
};

export default MoveFilesDialog;
