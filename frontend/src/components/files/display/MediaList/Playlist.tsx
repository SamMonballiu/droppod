import { FileInfo } from "@models/fileinfo";
import {
  PlaylistMode,
  useMediaListContext,
} from "@root/context/useMediaListContext";
import { FC } from "react";
import { FaChevronUp, FaChevronDown } from "react-icons/fa";
import styles from "./Playlist.module.scss";
import cx from "classnames";
import { AiOutlineClose } from "react-icons/ai";
import { AudioPlayer } from "./AudioPlayer";

interface Props {
  mode: PlaylistMode;
  onSetMode: (mode: PlaylistMode) => void;
}

export const Playlist: FC<Props> = ({ mode, onSetMode }) => {
  const {
    files: playlist,
    removeFile,
    activeFile,
    setActiveFile,
  } = useMediaListContext();

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
        <AudioPlayer />
        <div className={styles.titles}>
          {mode === "full" ? (
            playlist.map((item, idx) => (
              <div className={styles.playlistItem} key={item.fullPath}>
                <AiOutlineClose onClick={() => removeFromPlaylist(item)} />
                <p
                  className={cx({
                    [styles.playing]: item.fullPath === activeFile?.fullPath,
                  })}
                  onDoubleClick={() => setActiveFile(playlist[idx])}
                >
                  {item.filename}
                </p>
              </div>
            ))
          ) : mode === "mini" ? null : (
            <p className={styles.playing} onClick={() => onSetMode("full")}>
              {activeFile?.filename}
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
