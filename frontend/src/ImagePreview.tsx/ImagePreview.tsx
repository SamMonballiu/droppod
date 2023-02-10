import { FileInfo, getOrientation } from "../../../models/fileinfo";
import styles from "./ImagePreview.module.scss";
import React, { FC } from "react";
import { useQuery } from "react-query";
import { GoFileMedia } from "react-icons/go";
import cx from "classnames";

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
  quality = 30,
  square = false,
  dimension = 1000,
}) => {
  if (file.dimensions === undefined) {
    return null;
  }

  const orientation = getOrientation(file);
  const size = square
    ? `${dimension}x${dimension}`
    : orientation === "landscape"
    ? `${dimension}x0`
    : `0x${dimension}`;

  const { data: imageData, isFetching: isFetchingImage } = useQuery(
    ["thumbnail", file, dimension, square],
    async () => {
      const response = await fetch(
        `${url}thumbnail?file=${file.filename}&size=${size}&quality=${quality}`
      );
      const blob = await response.blob();
      const imageObjectUrl = URL.createObjectURL(blob);
      return imageObjectUrl;
    },
    {
      staleTime: Infinity,
    }
  );

  if (isFetchingImage) {
    return (
      <div className={cx(styles.preview, styles.image, className)}>
        <GoFileMedia />
      </div>
    );
  } else {
    return <img src={imageData} className={cx(styles.image, className)} />;
  }
};

export default ImagePreview;
