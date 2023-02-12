import React, { FC } from "react";
import { FileInfo, getSize } from "../../../models/fileinfo";
import Dialog from "../Dialog/Dialog";
import FileSize from "../FileSize/FileSize";
import ImagePreview from "../ImagePreview.tsx/ImagePreview";
import styles from "./FileDialog.module.scss";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  file: FileInfo;
}

const FileDialog: FC<Props> = ({ isOpen, onClose, file }) => {
  const dimensionsInfo = `${file.dimensions?.width}x${file.dimensions?.height}px`;
  return (
    <Dialog isOpen={isOpen} onClose={onClose}>
      <div>
        <ImagePreview file={file} className={styles.image} />
        <div className={styles.info}>
          <h3>{file.filename}</h3>
          <p>{new Date(file.dateAdded).toLocaleDateString()}</p>
          <p>
            <FileSize file={file} />
          </p>
          {file.dimensions && <p>{dimensionsInfo}</p>}
          <a href={file.fullPath} target="_blank">
            link
          </a>
        </div>
      </div>
    </Dialog>
  );
};

export default FileDialog;
