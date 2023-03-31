import { FC } from "react";
import { FileInfo, isImage } from "@models/fileinfo";
import { FileProperties, ImagePreview, Dialog } from "@components";
import styles from "./FileDialog.module.scss";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  file: FileInfo;
}

export const FileDialog: FC<Props> = ({ isOpen, onClose, file }) => {
  return (
    <Dialog isOpen={isOpen} onClose={onClose}>
      <div>
        {isImage(file) && <ImagePreview file={file} className={styles.image} />}
        <FileProperties file={file} />
      </div>
    </Dialog>
  );
};
