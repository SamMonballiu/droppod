import { FC } from "react";
import { FileInfo, FileType, is } from "@models/fileinfo";
import { FileProperties, ImagePreview, Dialog } from "@components";
import styles from "./FileDialog.module.scss";
import { MediaPreview } from "@components";
import { TextPreview } from "@components/files/preview/TextPreview/TextPreview";
import {
  BooleanContextProvider,
  useBooleanContext,
} from "@root/context/useBooleanContext";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  file: FileInfo;
  onSave?: (filename: string, contents: string) => Promise<void>;
}

const { Image, Video, Audio, Text } = FileType;

export const FileDialog: FC<Props> = ({ isOpen, onClose, file, onSave }) => {
  return (
    <BooleanContextProvider>
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
            {is(file, Text) && (
              <TextPreview file={file} isEdit onSave={onSave} />
            )}
          </div>
          <FileProperties file={file} />
        </div>
      </Dialog>
    </BooleanContextProvider>
  );
};
