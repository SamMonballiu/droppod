import { FC } from "react";
import { FileInfo } from "@models/fileinfo";
import { ImagePreview } from "@components";

interface Props {
  file: FileInfo;
  onClick?: () => void;
  id?: string;
  className?: string;
}

export const Thumbnail: FC<Props> = ({ file, onClick, id, className }) => {
  return (
    <div onClick={onClick} id={id} style={{ minHeight: "inherit" }}>
      <ImagePreview file={file} square dimension={200} className={className} />
    </div>
  );
};
