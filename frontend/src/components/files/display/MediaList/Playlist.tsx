import { FileInfo } from "@models/fileinfo";
import ProgressBar from "@ohaeseong/react-progress-bar";
import {
  PlaylistMode,
  useMediaListContext,
} from "@root/context/useMediaListContext";
import { FC, useRef, useState } from "react";
import {
  FaPause,
  FaPlay,
  FaStepBackward,
  FaStepForward,
  FaVolumeUp,
  FaVolumeMute,
  FaChevronUp,
  FaChevronDown,
} from "react-icons/fa";
import styles from "./Playlist.module.scss";
import cx from "classnames";
import { AiOutlineClose } from "react-icons/ai";

const getPath = (file: FileInfo) => {
  const path = `${window.location.protocol}//${window.location.host.replace(
    "5173",
    "4004"
  )}/${encodeURIComponent(file.fullPath)}`;
  return path;
};

interface Props {
  mode: PlaylistMode;
  onSetMode: (mode: PlaylistMode) => void;
}

export const Playlist: FC<Props> = ({ mode, onSetMode }) => {
  const { files: playlist, removeFile } = useMediaListContext();
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handlePlay = () => {
    audioRef.current?.play();
  };

  const goToPrevious = () => {
    if (activeIndex > 0) {
      setActiveIndex(activeIndex - 1);
    }
  };

  const gotoNext = () => {
    if (activeIndex < playlist.length - 1) {
      setActiveIndex(activeIndex + 1);
    }
  };

  const removeFromPlaylist = (file: FileInfo) => {
    removeFile(file);
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

  const ModeIcon = mode === "condensed" ? FaChevronUp : FaChevronDown;
  const VolumeIcon = audioRef.current?.volume === 0 ? FaVolumeMute : FaVolumeUp;

  return (
    <div
      className={cx(styles.playlist, {
        [styles.full]: mode === "full",
        [styles.small]: mode === "condensed",
      })}
    >
      <section className={styles.panel}>
        <div className={styles.controls}>
          <FaStepBackward onClick={goToPrevious} />
          {isPlaying ? (
            <FaPause onClick={() => audioRef.current?.pause()} />
          ) : (
            <FaPlay onClick={handlePlay} />
          )}

          <FaStepForward onClick={gotoNext} />

          {playlist.length ? (
            <audio
              style={{ display: "none" }}
              ref={audioRef}
              src={getPath(playlist[activeIndex])}
              autoPlay={true}
              onEnded={gotoNext}
              onPause={() => setIsPlaying(false)}
              onTimeUpdate={() => {
                setIsPlaying(true);
                setCurrentTime(
                  (audioRef.current?.currentTime ?? 1) /
                    (audioRef.current?.duration ?? 1)
                );
              }}
            />
          ) : null}

          <div style={{ flexGrow: 1 }}>
            <PlaylistProgressBar
              value={currentTime}
              onClick={(percentage) => {
                if (!audioRef.current) {
                  return;
                }

                const time = audioRef.current?.duration * (percentage / 100);
                audioRef.current!.currentTime = time;
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
        </div>

        {mode === "full" ? (
          <div className={styles.volume}>
            <VolumeIcon
              onClick={() => {
                if (!audioRef.current) return;
                audioRef.current.volume = audioRef.current.volume === 1 ? 0 : 1;
              }}
            />
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

        <div className={styles.titles}>
          {mode === "full" ? (
            playlist.map((item, idx) => (
              <div className={styles.playlistItem}>
                <AiOutlineClose onClick={() => removeFromPlaylist(item)} />
                <p
                  key={item.fullPath}
                  className={cx({ [styles.playing]: idx === activeIndex })}
                  onDoubleClick={() => setActiveIndex(idx)}
                >
                  {item.filename}
                </p>
              </div>
            ))
          ) : (
            <p className={styles.playing}>{playlist[activeIndex]?.filename}</p>
          )}
        </div>
      </section>

      {/* <section> */}
      <ModeIcon
        className={styles.modeIcon}
        onClick={() => onSetMode(mode === "condensed" ? "full" : "condensed")}
      />
      {/* </section> */}
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
        transitionDuration="0.1s"
      />
    </div>
  );
};
