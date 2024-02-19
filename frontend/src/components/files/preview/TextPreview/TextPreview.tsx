import { FileInfo } from "@models/fileinfo";
import axios from "axios";
import { FC, useState, useEffect } from "react";
import { useQuery } from "react-query";
import styles from "./TextPreview.module.scss";

interface Props {
  file?: FileInfo;
  isEdit?: boolean;
  value?: string;
  onChange?: (value: string) => void;
}

export const TextPreview: FC<Props> = ({ file, isEdit, value, onChange }) => {
  const [text, setText] = useState(value ?? "");
  useEffect(() => {
    onChange?.(text);
  }, [text]);

  const { isFetching } = useQuery(
    ["files", file],
    async () => {
      return await axios.get("/files/contents?path=" + file!.fullPath);
    },
    {
      enabled: file !== undefined,
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
