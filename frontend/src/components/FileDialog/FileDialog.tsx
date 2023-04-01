import { FC } from "react";
import { FileInfo, FileType, is } from "@models/fileinfo";
import { FileProperties, ImagePreview, Dialog } from "@components";
import styles from "./FileDialog.module.scss";
import { VideoPreview } from "@components";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  file: FileInfo;
}

const { Image, Video } = FileType;

export const FileDialog: FC<Props> = ({ isOpen, onClose, file }) => {
  return (
    <Dialog isOpen={isOpen} onClose={onClose}>
      <div>
        <div className={styles.preview}>
          {is(file, Image) && (
            <ImagePreview file={file} className={styles.image} />
          )}
          {is(file, Video) && (
            <VideoPreview
              file={file}
              className={styles.video}
              controls
              autoPlay
            />
          )}
        </div>
        <FileProperties file={file} />
      </div>
    </Dialog>
  );
};
