import React, { FC } from "react";
import { FileInfo } from "../../../models/fileinfo";
import Dialog from "../Dialog/Dialog";
import styles from "./FileDialog.module.scss";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  file: FileInfo;
}

const FileDialog: FC<Props> = ({ isOpen, onClose, file }) => {
  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={file.filename}>
      <p>Test</p>
    </Dialog>
  );
};

export default FileDialog;
