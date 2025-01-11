import styles from "./upload.module.scss";
import React, { FC, useRef, useState } from "react";
import { useMutation, useQueryClient } from "react-query";
import axios from "axios";
import { UploadFromUrl } from "./UploadFromUrl";
import ProgressBar from "@ohaeseong/react-progress-bar";

interface Props {
  folder: string;
  onError?: (err: Error | string) => void;
  baseUrl: string;
}

export const Upload: FC<Props> = ({ onError, baseUrl, folder }) => {
  const [state, setState] = useState<"initial" | "progress" | "success">(
    "initial"
  );
  const files = useRef<HTMLInputElement | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const queryClient = useQueryClient();
  const { mutateAsync, isLoading: isUploading } = useMutation(
    async (formData: FormData) => {
      const url = `${baseUrl}upload_files?folder=${folder}`;
      try {
        setState("progress");
        return await axios.post(url, formData, {
          onUploadProgress: (progressEvent) => {
            const total = progressEvent.total || 0;
            const current = progressEvent.loaded;
            const percentCompleted = Math.round((current * 100) / total);
            if (percentCompleted % 4 === 0) {
              setUploadProgress(percentCompleted);
            }
          },
        });
      } catch (err) {
        onError?.(err as unknown as string | Error);
      }
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["files", folder]);
        setTimeout(() => {
          setState("success");
          setUploadProgress(0);
        }, 600);
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

        {state === "initial" && uploadProgress === 0 && !isUploading ? (
          <button
            className={styles.submitBtn}
            type="submit"
            disabled={isUploading}
          >
            Upload
          </button>
        ) : null}

        {state !== "initial" ? (
          <div className={styles.frame}>
            {state === "progress" ? (
              <>
                <span>Uploading...</span>

                <div className={styles.progress}>
                  <ProgressBar
                    value={uploadProgress}
                    max={100}
                    labelVisible={false}
                    transitionDuration="0.1s"
                    trackColor="#89C95A"
                  />
                </div>
              </>
            ) : (
              <>
                <span>Upload complete!</span>
                <span
                  className={styles.link}
                  onClick={() => setState("initial")}
                >
                  Upload more
                </span>
              </>
            )}
          </div>
        ) : null}
      </form>

      <UploadFromUrl folder={folder} onError={onError} baseUrl={baseUrl} />
    </div>
  );
};
