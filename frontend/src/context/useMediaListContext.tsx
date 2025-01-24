import { Playlist } from "@components/files/display/MediaList/Playlist";
import { FileInfo, FileType, is } from "@models/fileinfo";
import React, { createContext, useContext, useState, FC } from "react";

interface MediaListContextData {
  files: FileInfo[];
  addFile: (file: FileInfo) => void;
  addFiles: (files: FileInfo[]) => void;
  removeFile: (file: FileInfo) => void;
}

const MediaListContext = createContext<MediaListContextData>(
  //@ts-ignore
  {}
);

export function useMediaListContext() {
  return useContext(MediaListContext);
}

export type PlaylistMode = "condensed" | "full";

export const MediaListContextProvider: FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [mode, setMode] = useState<PlaylistMode>("condensed");

  React.useEffect(() => {
    console.log("F", files);
  }, [files]);

  const has = (file: FileInfo) =>
    files.some((f) => f.fullPath === file.fullPath);

  const addFile = (file: FileInfo) => {
    if (!has(file)) {
      setFiles([...files, file]);
    }
  };

  const addFiles = (fileArr: FileInfo[]) => {
    const audioFiles = fileArr.filter((f) => is(f, FileType.Audio) && !has(f));
    setFiles([...files, ...audioFiles]);
  };

  const removeFile = (file: FileInfo) => {
    setFiles(files.filter((x) => x.fullPath !== file.fullPath));
  };

  return (
    <MediaListContext.Provider value={{ files, addFile, addFiles, removeFile }}>
      {children}
      {files.length > 0 ? <Playlist mode={mode} onSetMode={setMode} /> : null}
    </MediaListContext.Provider>
  );
};
