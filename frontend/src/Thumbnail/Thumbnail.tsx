import { FC } from "react";
import { FileInfo } from "../../../models/fileinfo";
import ImagePreview from "../ImagePreview.tsx/ImagePreview";

interface Props {
  file: FileInfo;
  onClick?: () => void;
  id?: string;
  className?: string;
}

const Thumbnail: FC<Props> = ({ file, onClick, id, className }) => {
  return (
    <div onClick={onClick} id={id}>
      <ImagePreview file={file} square dimension={300} className={className} />
    </div>
  );
};

export default Thumbnail;
