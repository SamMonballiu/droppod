import { FileInfo } from "@models/fileinfo";
import ProgressBar from "@ohaeseong/react-progress-bar";
import { PlaylistMode } from "@root/context/useMediaListContext";
import { FC, useEffect, useRef, useState } from "react";
import {
  FaPause,
  FaPlay,
  FaStepBackward,
  FaStepForward,
  FaVolumeMute,
  FaVolumeUp,
} from "react-icons/fa";
import styles from "./AudioPlayer.module.scss";
import cx from "classnames";

interface Props {
  mode: PlaylistMode;
  file: FileInfo;
  autoPlay?: boolean;
  itemPosition?: [number, number];
  onNext?: () => void;
  onPrevious?: () => void;
  onPlay?: () => void;
  onPause?: () => void;
  className?: string;
  disabled?: boolean;
}

const getPath = (file: FileInfo | null) => {
  if (!file) return "";
  const path = `${window.location.protocol}//${window.location.host.replace(
    "5173",
    "4004"
  )}/${encodeURIComponent(file.fullPath)}`;
  return path;
};

export const AudioPlayer: FC<Props> = ({
  mode,
  file,
  autoPlay = false,
  itemPosition,
  onNext,
  onPrevious,
  onPlay,
  onPause,
  className,
  disabled = false,
}) => {
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

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

  const htmlAudioElement = (
    <audio
      style={{ display: "none" }}
      ref={audioRef}
      src={getPath(file)}
      autoPlay={autoPlay && !disabled}
      onEnded={() => {
        onNext?.();
        setCurrentTime(0);
        audioRef.current!.currentTime = 0;
      }}
      onPlay={() => {
        onPlay?.();
        setIsPlaying(true);
      }}
      onPause={() => {
        onPause?.();
        setIsPlaying(false);
      }}
    />
  );

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
    <div className={cx(styles.container, className)}>
      <div className={styles.controls}>
        {onPrevious && mode !== "mini" ? (
          <FaStepBackward
            onClick={disabled ? undefined : onPrevious}
            className={cx({ [styles.disabled]: disabled })}
          />
        ) : null}
        {isPlaying ? (
          <FaPause
            onClick={
              disabled
                ? undefined
                : () => {
                    onPause?.();
                    audioRef.current?.pause();
                  }
            }
            className={cx({ [styles.disabled]: disabled })}
          />
        ) : (
          <FaPlay
            onClick={disabled ? undefined : handlePlay}
            className={cx({ [styles.disabled]: disabled })}
          />
        )}

        {onNext && mode !== "mini" ? <FaStepForward onClick={onNext} /> : null}

        {htmlAudioElement}

        {mode !== "mini" ? (
          <>
            <div className={styles.progress}>
              {itemPosition && audioRef.current && (
                <span className={styles.timestamp}>
                  {itemPosition[0]}/{itemPosition[1]}
                </span>
              )}
            </div>

            <div style={{ flexGrow: 1 }}>
              <PlaylistProgressBar
                value={currentTime}
                disabled={disabled}
                onClick={
                  disabled
                    ? undefined
                    : (percentage) => {
                        if (!audioRef.current) {
                          return;
                        }

                        const ratio = percentage / 100;

                        const time = audioRef.current?.duration * ratio;
                        audioRef.current!.currentTime = time;
                        setCurrentTime(ratio);
                      }
                }
              />
            </div>

            <div className={styles.progress}>
              {audioRef.current && (
                <span className={styles.timestamp}>
                  {convertToTimestamp(audioRef.current.currentTime)} /{" "}
                  {convertToTimestamp(audioRef.current.duration)}
                </span>
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
  disabled?: boolean;
}

const PlaylistProgressBar: FC<ProgressBarProps> = ({
  value,
  onClick,
  height = 15,
  color = "#89C95A",
  disabled = false,
}) => {
  const handleClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const div = event.currentTarget; // Get the clicked div
    const rect = div.getBoundingClientRect(); // Get the dimensions and position of the div
    const clickX = event.clientX - rect.left; // Calculate the click position relative to the div
    const percentage = (clickX / rect.width) * 100; // Calculate the percentage
    onClick?.(percentage);
  };

  return (
    <div
      onClick={handleClick}
      style={{ cursor: disabled ? "default" : "pointer" }}
    >
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
