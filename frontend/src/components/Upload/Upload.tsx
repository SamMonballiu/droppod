import styles from "./upload.module.scss";
import React, { FC, useRef, useState } from "react";
import { QueryClient, useMutation, useQueryClient } from "react-query";
import cx from "classnames";
import axios from "axios";

interface Props {
  folder: string;
  onError?: (err: Error | string) => void;
  baseUrl: string;
}

const Upload: FC<Props> = ({ onError, baseUrl, folder }) => {
  const [state, setState] = useState<"progress" | "success">("progress");
  const files = useRef<HTMLInputElement | null>(null);

  const queryClient = useQueryClient();
  const { mutateAsync, isLoading, isSuccess } = useMutation(
    async (formData: FormData) => {
      const url = `${baseUrl}upload_files?folder=${folder}`;
      try {
        return await axios.post(url, formData);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (files.current!.files!.length === 0) {
      return;
    }

    const formData = new FormData();
    for (let i = 0; i < files.current!.files!.length; i++) {
      formData.append("files", files.current!.files![i]);
    }
    await mutateAsync(formData);
  };

  return (
    <div>
      <form id="form" onSubmit={handleSubmit}>
        <div className={styles.inputGroup}>
          <label htmlFor="files">Select files</label>
          <input
            type="file"
            ref={files}
            multiple
            disabled={state === "success"}
          />
        </div>

        {state === "progress" && (
          <button
            className={cx(styles.submitBtn, { [styles.disabled]: isLoading })}
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? "Uploading... " : "Upload"}
          </button>
        )}

        {state === "success" && (
          <div className={styles.success}>
            <span>Upload complete!</span>
            <span className={styles.link} onClick={() => setState("progress")}>
              Upload more
            </span>
          </div>
        )}
      </form>
    </div>
  );
};

export default Upload;
