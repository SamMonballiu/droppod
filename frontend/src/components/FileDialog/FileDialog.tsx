import { FC } from "react";
import { FileInfo, isImage } from "../../../../models/fileinfo";
import ImagePreview from "../../ImagePreview.tsx/ImagePreview";
import Dialog from "../Dialog/Dialog";
import FileProperties from "../FileProperties/FileProperties";
import styles from "./FileDialog.module.scss";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  file: FileInfo;
}

const FileDialog: FC<Props> = ({ isOpen, onClose, file }) => {
  return (
    <Dialog isOpen={isOpen} onClose={onClose}>
      <div>
        {isImage(file) && <ImagePreview file={file} className={styles.image} />}
        <FileProperties file={file} />
      </div>
    </Dialog>
  );
};

export default FileDialog;
