import { FC } from "react";
import { FileInfo, FileType, is } from "@models/fileinfo";
import { FileProperties, ImagePreview, Dialog } from "@components";
import styles from "./FileDialog.module.scss";
import { MediaPreview } from "@components";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  file: FileInfo;
}

const { Image, Video, Audio } = FileType;

export const FileDialog: FC<Props> = ({ isOpen, onClose, file }) => {
  return (
    <Dialog isOpen={isOpen} onClose={onClose}>
      <div>
        <div className={styles.preview}>
          {is(file, Image) && (
            <ImagePreview file={file} className={styles.image} />
          )}
          {is(file, Video) && (
            <MediaPreview
              file={file}
              className={styles.video}
              controls
              autoPlay
            />
          )}
          {is(file, Audio) && <MediaPreview file={file} controls />}
        </div>
        <FileProperties file={file} />
      </div>
    </Dialog>
  );
};
