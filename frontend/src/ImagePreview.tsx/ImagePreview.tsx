import { FileInfo, getOrientation } from "../../../models/fileinfo";
import styles from "./ImagePreview.module.scss";
import { FC, useEffect } from "react";
import { useQuery, useQueryClient } from "react-query";
import cx from "classnames";
import { useInView } from "react-intersection-observer";
import axios from "axios";
import Loading from "../components/Loading/Loading";

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
  const queryClient = useQueryClient();

  useEffect(() => {
    queryClient.cancelQueries(["thumbnail", file, dimension, square]);
  }, []);

  const orientation = getOrientation(file);
  const size = square
    ? `${dimension}x${dimension}`
    : orientation === "landscape"
    ? `${dimension}x0`
    : `0x${dimension}`;

  const path =
    file.relativePath === ""
      ? file.filename
      : `${file.relativePath}/${file.filename}`;

  const { data: imageData, isFetching: isFetchingImage } = useQuery(
    ["thumbnail", file, dimension, square],
    async ({ signal }) => {
      const fetchUrl = file.dimensions
        ? `${url}thumbnail?file=${path}&size=${size}&quality=${quality}`
        : `${url}thumbnail?file=${path}&percentage=30&quality=${quality}`;
      const response = (
        await axios.get(fetchUrl, { responseType: "blob", signal })
      ).data;
      const imageObjectUrl = URL.createObjectURL(response);
      return imageObjectUrl;
    },
    {
      staleTime: Infinity,
      enabled: inView,
    }
  );

  return (
    <div className={cx(styles.container, className)} ref={ref}>
      {isFetchingImage ? (
        <Loading className={styles.preview} />
      ) : (
        <img src={imageData} className={styles.image} />
      )}
    </div>
  );
};

export default ImagePreview;
