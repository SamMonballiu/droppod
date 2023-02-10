import React, { FC } from "react";
import { FileInfo } from "../../../models/fileinfo";
import Dialog from "../Dialog/Dialog";
import ImagePreview from "../ImagePreview.tsx/ImagePreview";
import styles from "./FileDialog.module.scss";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  file: FileInfo;
}

const FileDialog: FC<Props> = ({ isOpen, onClose, file }) => {
  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={file.filename}>
      <ImagePreview file={file} />
      <p>Test</p>
    </Dialog>
  );
};

export default FileDialog;
