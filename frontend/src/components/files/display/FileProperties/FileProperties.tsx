import { FC } from "react";
import { FileInfo, FileType, hasRawExtension, is } from "@models/fileinfo";
import { FileSize, FileRating } from "@components";
import styles from "./FileProperties.module.scss";
import cx from "classnames";
import { ImageInfoResponse } from "@models/response";
import { useQuery } from "react-query";
import axios from "axios";
import { useMediaListContext } from "@root/context/useMediaListContext";

interface Props {
  file: FileInfo;
  className?: string;
  properties?: (keyof FileInfo)[];
}

export const FileProperties: FC<Props> = ({
  file,
  className,
  properties = [
    "filename",
    "rating",
    "dateAdded",
    "dimensions",
    "size",
    "fullPath",
  ],
}) => {
  const { addFile } = useMediaListContext();
  const isNonRawImage =
    is(file, FileType.Image) && !hasRawExtension(file.filename);

  const { data: imageInfo, isFetched: hasInfo } = useQuery(
    ["info", file],
    async () =>
      await axios.get<ImageInfoResponse>(`/image/info?path=${file.fullPath}`),
    {
      enabled: isNonRawImage,
    }
  );

  type FileProperty = keyof FileInfo | "dimensions";

  const parts: Map<FileProperty, React.ReactNode> = new Map<
    FileProperty,
    React.ReactNode
  >([
    ["filename", <h3>{file.filename}</h3>],
    ["dateAdded", <p>{file.dateAdded.toLocaleDateString()}</p>],
    ["size", <FileSize files={[file]} />],
    [
      "dimensions",
      isNonRawImage && hasInfo ? (
        <p>{`${imageInfo!.data.dimensions.width}x${
          imageInfo!.data.dimensions.height
        }px`}</p>
      ) : (
        <></>
      ),
    ],
    [
      "fullPath",
      <a href={file.fullPath} target="_blank">
        link
      </a>,
    ],
    ["rating", <FileRating file={file} />],
  ]);

  return (
    <div className={cx(styles.container, className)}>
      {/* @ts-ignore */}
      {properties.map((p) => ({ ...parts.get(p), key: p }))}
      {is(file, FileType.Audio) ? (
        <a href="#" onClick={() => addFile(file)}>
          add to playlist
        </a>
      ) : null}
    </div>
  );
};
