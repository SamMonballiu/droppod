import { FileInfo } from "@models/fileinfo";
import axios from "axios";
import { FC, useState } from "react";
import { useQuery } from "react-query";
import styles from "./TextPreview.module.scss";

interface Props {
  file: FileInfo;
}

export const TextPreview: FC<Props> = ({ file }) => {
  const isEdit = false;
  const [text, setText] = useState("");

  const { isFetching } = useQuery(
    ["files", file],
    async () => {
      return await axios.get("/files/contents?path=" + file.fullPath);
    },
    {
      onSuccess: (resp) => setText(resp.data),
    }
  );

  return isFetching ? null : (
    <div className={styles.contents}>
      {isEdit ? (
        <textarea value={text} onChange={(e) => setText(e.target.value)} />
      ) : (
        <p>{text}</p>
      )}
    </div>
  );
};
