import { FC, useEffect, useRef, useState } from "react";
import styles from "./AudioPlayer.module.scss";
import { useMediaListContext } from "@root/context/useMediaListContext";
import {
  FaStepBackward,
  FaPause,
  FaPlay,
  FaStepForward,
  FaVolumeMute,
  FaVolumeUp,
} from "react-icons/fa";
import ProgressBar from "@ohaeseong/react-progress-bar";
import { FileInfo } from "@models/fileinfo";

const getPath = (file: FileInfo | null) => {
  if (!file) return "";
  const path = `${window.location.protocol}//${window.location.host.replace(
    "5173",
    "4004"
  )}/${encodeURIComponent(file.fullPath)}`;
  return path;
};

export const AudioPlayer: FC = () => {
  const {
    files: playlist,
    mode,
    activeFile: currentSong,
    setActiveFile: playSong,
  } = useMediaListContext();
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

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
        setCurrentTime(0);
        playSong(playlist[idx - 1]);
      }
    },
    next: () => {
      const idx = playlist.indexOf(currentSong!);
      if (can().next) {
        setCurrentTime(0);
        playSong(playlist[idx + 1]);
      }
    },
  };

  useEffect(() => {
    const updateTime = () => {
      if (audioRef.current) {
        const time = audioRef.current.currentTime;
        const ratio = (time ?? 0) / (audioRef.current?.duration ?? 1);
        setCurrentTime(ratio);
      }
    };

    let interval: number;
    if (isPlaying) {
      interval = setInterval(() => {
        updateTime();
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isPlaying]);

  const htmlAudioElement = playlist.length ? (
    <audio
      style={{ display: "none" }}
      ref={audioRef}
      src={getPath(currentSong)}
      autoPlay={true}
      onEnded={handle.next}
      onPlay={() => setIsPlaying(true)}
      onPause={() => setIsPlaying(false)}
    />
  ) : null;

  const handlePlay = () => {
    setIsPlaying(true);
    audioRef.current?.play();
  };

  const convertToTimestamp = (val: number) => {
    let minutes = 0;
    let converted = val;
    while (converted >= 60) {
      minutes++;
      converted -= 60;
    }

    return `${minutes}:${converted.toFixed(0).padStart(2, "0")}`;
  };

  const VolumeIcon = audioRef.current?.volume === 0 ? FaVolumeMute : FaVolumeUp;

  const volumeIcon = (
    <VolumeIcon
      onClick={() => {
        if (!audioRef.current) return;
        audioRef.current.volume = audioRef.current.volume === 1 ? 0 : 1;
      }}
    />
  );

  return (
    <div className={styles.container}>
      <div className={styles.controls}>
        {mode !== "mini" ? <FaStepBackward onClick={handle.previous} /> : null}
        {isPlaying ? (
          <FaPause onClick={() => audioRef.current?.pause()} />
        ) : (
          <FaPlay onClick={handlePlay} />
        )}

        {mode !== "mini" ? <FaStepForward onClick={handle.next} /> : null}
        {htmlAudioElement}

        {mode !== "mini" ? (
          <>
            <div className={styles.progress}>
              {audioRef.current && (
                <span className={styles.timestamp}>
                  {playlist.indexOf(currentSong!) + 1}/{playlist.length}
                </span>
              )}
            </div>

            <div style={{ flexGrow: 1 }}>
              <PlaylistProgressBar
                value={currentTime}
                onClick={(percentage) => {
                  if (!audioRef.current) {
                    return;
                  }

                  const ratio = percentage / 100;

                  const time = audioRef.current?.duration * ratio;
                  audioRef.current!.currentTime = time;
                  setCurrentTime(ratio);
                }}
              />
            </div>

            <div className={styles.progress}>
              {audioRef.current && (
                <>
                  <span className={styles.timestamp}>
                    {convertToTimestamp(audioRef.current.currentTime)} /{" "}
                    {convertToTimestamp(audioRef.current.duration)}
                  </span>
                </>
              )}
            </div>
          </>
        ) : null}

        {mode === "condensed" || mode === "mini" ? volumeIcon : null}
      </div>

      {mode === "full" ? (
        <div className={styles.volume}>
          {volumeIcon}
          <div style={{ flexGrow: 1 }}>
            <PlaylistProgressBar
              height={8}
              color="cornflowerblue"
              value={audioRef.current?.volume ?? 0}
              onClick={(percentage) => {
                if (!audioRef.current) {
                  return;
                }

                audioRef.current!.volume = percentage / 100;
              }}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
};

interface ProgressBarProps {
  value: number;
  onClick?: (val: number) => void;
  height?: number;
  color?: React.ComponentProps<typeof ProgressBar>["color"];
}

const PlaylistProgressBar: FC<ProgressBarProps> = ({
  value,
  onClick,
  height = 15,
  color = "#89C95A",
}) => {
  const handleClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const div = event.currentTarget; // Get the clicked div
    const rect = div.getBoundingClientRect(); // Get the dimensions and position of the div
    const clickX = event.clientX - rect.left; // Calculate the click position relative to the div
    const percentage = (clickX / rect.width) * 100; // Calculate the percentage
    onClick?.(percentage);
  };

  return (
    <div onClick={handleClick} style={{ cursor: "pointer" }}>
      <ProgressBar
        value={value}
        max={1}
        height={height}
        trackColor={color}
        labelVisible={false}
        transitionDuration="0.05s"
      />
    </div>
  );
};
