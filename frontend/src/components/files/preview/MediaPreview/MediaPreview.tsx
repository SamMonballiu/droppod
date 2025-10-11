import { AudioPlayer } from "@components/files/display/MediaList/AudioPlayer";
import { FileInfo, FileType, is } from "@models/fileinfo";
import { useMediaListContext } from "@root/context/useMediaListContext";
import { FC } from "react";

interface Props {
  file: FileInfo;
  className?: string;
  autoPlay?: boolean;
}

export const MediaPreview: FC<Props> = ({ file, className, autoPlay }) => {
  const path = `${window.location.protocol}//${window.location.host.replace(
    "5173",
    "4004"
  )}/${encodeURIComponent(file.fullPath.substring(1))}`;

  const { isPlaying: isPlaylistPlaying } = useMediaListContext();

  if (is(file, FileType.Audio)) {
    return (
      <AudioPlayer
        file={file}
        autoPlay={autoPlay}
        mode="condensed"
        className={className}
        disabled={isPlaylistPlaying}
      />
    );
  }

  return (
    <video src={path} className={className} controls autoPlay={autoPlay} />
  );
};
