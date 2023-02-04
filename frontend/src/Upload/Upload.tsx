import "./upload.scss";
import React, { FC } from "react";

interface Props {
  onError?: (err: Error | string) => void;
  baseUrl: string;
}

const Upload: FC<Props> = ({ onError, baseUrl }) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const files = document.getElementById("files")! as HTMLInputElement;
    const formData = new FormData();

    for (let i = 0; i < files.files!.length; i++) {
      formData.append("files", files.files![i]);
    }

    const url = `${baseUrl}upload_files`;
    fetch(url, {
      method: "POST",
      body: formData,
    })
      .then((res) => console.log(res))
      .catch((err) => onError?.(err));
  };

  return (
    <div className="container">
      <h1>File Upload</h1>
      <form id="form" onSubmit={handleSubmit}>
        <div className="input-group">
          <label htmlFor="files">Select files</label>
          <input id="files" type="file" multiple />
        </div>
        <button className="submit-btn" type="submit">
          Upload
        </button>
      </form>
    </div>
  );
};

export default Upload;
