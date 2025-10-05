import { FileInfo } from "@models/fileinfo";
import ProgressBar from "@ohaeseong/react-progress-bar";
import {
  PlaylistMode,
  useMediaListContext,
} from "@root/context/useMediaListContext";
import { FC, useState } from "react";
import { FaChevronUp, FaChevronDown } from "react-icons/fa";
import styles from "./Playlist.module.scss";
import cx from "classnames";
import { AiOutlineClose } from "react-icons/ai";
import { AudioPlayer } from "./AudioPlayer";

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

  const ModeIcon = mode === "condensed" ? FaChevronUp : FaChevronDown;

  return (
    <div
      className={cx(styles.playlist, {
        [styles.mini]: mode === "mini",
        [styles.small]: mode === "condensed",
        [styles.full]: mode === "full",
      })}
    >
      <section className={styles.panel}>
        <AudioPlayer
          onNext={gotoNext}
          onPrevious={goToPrevious}
          path={getPath(playlist[activeIndex])}
          activeIndex={activeIndex}
        />
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
          ) : mode === "mini" ? null : (
            <p className={styles.playing} onClick={() => onSetMode("full")}>
              {playlist[activeIndex]?.filename}
            </p>
          )}
        </div>
      </section>

      {mode !== "mini" ? (
        <ModeIcon
          className={cx(styles.shrinkIcon, styles.rotated)}
          onClick={() => onSetMode(mode === "condensed" ? "mini" : "condensed")}
        />
      ) : null}

      <ModeIcon
        className={cx(styles.modeIcon, { [styles.rotated]: mode === "mini" })}
        onClick={() => onSetMode(mode === "condensed" ? "full" : "condensed")}
      />
    </div>
  );
};
