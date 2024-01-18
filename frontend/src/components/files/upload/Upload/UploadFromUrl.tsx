import React, { FC, useState } from "react";
import styles from "./upload.module.scss";
import { useMutation, useQueryClient } from "react-query";
import axios from "axios";
import cx from "classnames";
import { UploadFromUrlPostmodel } from "@backend/features/files/upload/uploadFromUrlPostmodel";

interface Props {
  folder: string;
  onError?: (err: Error | string) => void;
  baseUrl: string;
}

export const UploadFromUrl: FC<Props> = ({ folder, onError, baseUrl }) => {
  const [state, setState] = useState<"progress" | "success">("progress");
  const [fromUrl, setFromUrl] = useState("");
  const [newFilename, setNewFilename] = useState("");

  const queryClient = useQueryClient();
  const { mutateAsync, isLoading, isSuccess } = useMutation(
    async () => {
      const model: UploadFromUrlPostmodel = {
        folder,
        url: fromUrl,
        newName: newFilename === "" ? undefined : newFilename,
      };
      const url = `${baseUrl}upload/url`;
      try {
        return await axios.post(url, model);
      } catch (err) {
        onError?.(err as unknown as string | Error);
      }
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["files", folder]);
        setState("success");
      },
    }
  );

  const handleReset = () => {
    setState("progress");
    setFromUrl("");
    setNewFilename("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await mutateAsync();
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className={styles.input}>
        <label htmlFor="rename">URL:</label>
        <input
          id="rename"
          type="text"
          value={fromUrl}
          onChange={(e) => setFromUrl(e.target.value)}
        />
      </div>

      <div className={styles.input}>
        <label htmlFor="rename">New filename (optional):</label>
        <input
          id="rename"
          type="text"
          value={newFilename}
          onChange={(e) => setNewFilename(e.target.value)}
        />
      </div>

      {state === "progress" && (
        <button
          className={cx(styles.submitBtn, { [styles.disabled]: isLoading })}
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? "Uploading... " : "Upload from URL"}
        </button>
      )}

      {state === "success" && (
        <div className={styles.success}>
          <span>Upload complete!</span>
          <span className={styles.link} onClick={handleReset}>
            Upload more
          </span>
        </div>
      )}
    </form>
  );
};
