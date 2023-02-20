import { FileInfo, getOrientation } from "../../../models/fileinfo";
import styles from "./ImagePreview.module.scss";
import { FC } from "react";
import { useQuery } from "react-query";
import { GoFileMedia } from "react-icons/go";
import cx from "classnames";
import { useInView } from "react-intersection-observer";

interface Props {
  file: FileInfo;
  dimension?: number;
  quality?: number;
  square?: boolean;
  className?: string;
}

const url = import.meta.env.DEV
  ? window.location.href.replace("5173", "4004")
  : window.location.href;

const ImagePreview: FC<Props> = ({
  file,
  className,
  quality = 60,
  square = false,
  dimension = 1000,
}) => {
  const { ref, inView } = useInView();

  const orientation = getOrientation(file);
  const size = square
    ? `${dimension}x${dimension}`
    : orientation === "landscape"
    ? `${dimension}x0`
    : `0x${dimension}`;

  const { data: imageData, isFetching: isFetchingImage } = useQuery(
    ["thumbnail", file, dimension, square],
    async () => {
      const fetchUrl = file.dimensions
        ? `${url}thumbnail?file=${file.relativePath}&size=${size}&quality=${quality}`
        : `${url}thumbnail?file=${file.relativePath}&percentage=30&quality=${quality}`;
      const response = await fetch(fetchUrl);
      const blob = await response.blob();
      const imageObjectUrl = URL.createObjectURL(blob);
      return imageObjectUrl;
    },
    {
      staleTime: Infinity,
      enabled: inView,
    }
  );

  return (
    <div className={className} ref={ref}>
      {isFetchingImage ? (
        <div className={cx(styles.preview, styles.image, className)}>
          <GoFileMedia />
        </div>
      ) : (
        <img src={imageData} className={cx(styles.image, className)} />
      )}
    </div>
  );
};

export default ImagePreview;
