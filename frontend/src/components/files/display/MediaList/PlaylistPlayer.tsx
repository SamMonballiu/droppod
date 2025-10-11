import { FC } from "react";
import { useMediaListContext } from "@root/context/useMediaListContext";
import { AudioPlayer } from "./AudioPlayer";

export const PlaylistPlayer: FC = () => {
  const {
    files: playlist,
    mode,
    activeFile: currentSong,
    setActiveFile: playSong,
    setIsPlaying,
  } = useMediaListContext();

  const can = () => {
    const idx = playlist.indexOf(currentSong!);

    return {
      previous: idx > 0,
      next: idx < playlist.length - 1,
    };
  };

  const handle = {
    previous: () => {
      const idx = playlist.indexOf(currentSong!);
      if (can().previous) {
        playSong(playlist[idx - 1]);
      }
    },
    next: () => {
      const idx = playlist.indexOf(currentSong!);
      if (can().next) {
        playSong(playlist[idx + 1]);
      }
    },
  };

  return (
    <AudioPlayer
      autoPlay
      mode={mode}
      file={currentSong!}
      itemPosition={[playlist.indexOf(currentSong!) + 1, playlist.length]}
      onPlay={() => setIsPlaying(true)}
      onPause={() => setIsPlaying(false)}
      onPrevious={handle.previous}
      onNext={handle.next}
    />
  );
};
