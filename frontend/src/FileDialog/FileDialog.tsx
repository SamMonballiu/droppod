import React, { FC } from "react";
import { FileInfo, getSize } from "../../../models/fileinfo";
import Dialog from "../Dialog/Dialog";
import FileProperties from "../FileProperties/FileProperties";
import ImagePreview from "../ImagePreview.tsx/ImagePreview";
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
        <ImagePreview file={file} className={styles.image} />
        <FileProperties file={file} />
      </div>
    </Dialog>
  );
};

export default FileDialog;
