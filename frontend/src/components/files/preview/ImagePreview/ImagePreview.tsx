import { FileInfo, hasRawExtension } from "@models/fileinfo";
import styles from "./ImagePreview.module.scss";
import { FC, useEffect } from "react";
import { useQuery, useQueryClient } from "react-query";
import cx from "classnames";
import { useInView } from "react-intersection-observer";
import axios from "axios";
import { Loading } from "@components";
import { ImageInfoResponse } from "@models/response";

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

export const ImagePreview: FC<Props> = ({
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

  const path =
    file.relativePath === ""
      ? file.filename
      : `${file.relativePath}/${file.filename}`;

  const { data: imageInfo, isFetching: isFetchingInfo } = useQuery(
    ["info", file],
    async () =>
      await axios.get<ImageInfoResponse>(
        `${url}image/info?path=${encodeURIComponent(file.fullPath)}`
      ),
    {
      enabled: inView && !hasRawExtension(file.filename),
      staleTime: Infinity,
    }
  );

  const { data: imageData, isFetching: isFetchingImage } = useQuery(
    ["thumbnail", file, dimension, square],
    async ({ signal }) => {
      const orientation = imageInfo?.data.orientation;
      const size = square
        ? `${dimension}x${dimension}`
        : orientation === 1
        ? `${dimension}x0`
        : `0x${dimension}`;

      const fetchUrl = `${url}thumbnail?file=${encodeURIComponent(
        path
      )}&size=${size}&quality=${quality}`;
      const response = (
        await axios.get(fetchUrl, { responseType: "blob", signal })
      ).data;
      const imageObjectUrl = URL.createObjectURL(response);
      return imageObjectUrl;
    },
    {
      staleTime: Infinity,
      enabled: inView && !isFetchingInfo,
    }
  );

  return (
    <div className={cx(styles.container, className)} ref={ref}>
      {isFetchingImage || isFetchingInfo ? (
        <Loading className={styles.preview} />
      ) : (
        <img src={imageData} className={styles.image} />
      )}
    </div>
  );
};
