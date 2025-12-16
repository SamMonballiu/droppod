import { FileInfo, FileType, is } from "@models/fileinfo";
import React, { createContext, useContext, useState, FC } from "react";

interface MediaListContextData {
  files: FileInfo[];
  setFiles: (files: FileInfo[]) => void;
  addFile: (file: FileInfo) => void;
  addFiles: (files: FileInfo[]) => void;
  removeFile: (file: FileInfo) => void;
  mode: PlaylistMode;
  setMode: (mode: PlaylistMode) => void;
  activeFile: FileInfo | null;
  setActiveFile: (file: FileInfo) => void;
  isPlaying: boolean;
  setIsPlaying: (val: boolean) => void;
}

const MediaListContext = createContext<MediaListContextData>(
  //@ts-ignore
  {}
);

export function useMediaListContext() {
  return useContext(MediaListContext);
}

export type PlaylistMode = "hidden" | "mini" | "condensed" | "full";

export const MediaListContextProvider: FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [files, setFilesState] = useState<FileInfo[]>([]);
  const [activeFile, setActiveFileState] = useState<FileInfo | null>(null);
  const [mode, setMode] = useState<PlaylistMode>("condensed");
  const [isPlaying, setIsPlaying] = useState(false);

  const has = (file: FileInfo) =>
    files.some((f) => f.fullPath === file.fullPath);

  const addFile = (file: FileInfo) => {
    if (!has(file)) {
      if (files.length === 0) {
        setActiveFileState(file);
      }
      setFilesState([...files, file]);
    }
  };

  const addFiles = (fileArr: FileInfo[]) => {
    const audioFiles = fileArr.filter((f) => is(f, FileType.Audio) && !has(f));
    setFilesState([...files, ...audioFiles]);
    setActiveFile(fileArr[0]);
  };

  const removeFile = (file: FileInfo) => {
    setFilesState(files.filter((x) => x.fullPath !== file.fullPath));
  };

  const setActiveFile = (file: FileInfo) => {
    setActiveFileState(file);
  };

  return (
    <MediaListContext.Provider
      value={{
        files,
        setFiles: setFilesState,
        addFile,
        addFiles,
        removeFile,
        mode,
        setMode,
        activeFile,
        setActiveFile,
        isPlaying,
        setIsPlaying,
      }}
    >
      {children}
    </MediaListContext.Provider>
  );
};
