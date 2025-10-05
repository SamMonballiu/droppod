import { FC, useRef, useState } from "react";
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

interface Props {
  onNext: () => void;
  onPrevious: () => void;
  path: string;
  activeIndex: number;
}

export const AudioPlayer: FC<Props> = ({
  onNext,
  onPrevious,
  path,
  activeIndex,
}) => {
  const { files: playlist, mode } = useMediaListContext();
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handle = {
    previous: () => {
      setCurrentTime(0);
      onPrevious();
    },
    next: () => {
      setCurrentTime(0);
      onNext();
    },
  };

  const player = playlist.length ? (
    <audio
      style={{ display: "none" }}
      ref={audioRef}
      src={path}
      autoPlay={true}
      onEnded={handle.next}
      onPause={() => setIsPlaying(false)}
      onTimeUpdate={() => {
        setIsPlaying(true);
        setCurrentTime(
          (audioRef.current?.currentTime ?? 1) /
            (audioRef.current?.duration ?? 1)
        );
      }}
    />
  ) : null;

  const handlePlay = () => {
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
        {player}

        {mode !== "mini" ? (
          <>
            <div className={styles.progress}>
              {audioRef.current && (
                <span className={styles.timestamp}>
                  {activeIndex + 1}/{playlist.length}
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
          </>
        ) : null}

        {mode === "condensed" ? volumeIcon : null}
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
        transitionDuration="0.1s"
      />
    </div>
  );
};
