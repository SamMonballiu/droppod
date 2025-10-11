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
import { PlaylistPlayer } from "./PlaylistPlayer";
import { insert } from "@formkit/drag-and-drop";
import { useDragAndDrop } from "@formkit/drag-and-drop/react";

interface Props {
  mode: PlaylistMode;
  onSetMode: (mode: PlaylistMode) => void;
}

export const Playlist: FC<Props> = ({ mode, onSetMode }) => {
  const { activeFile } = useMediaListContext();

  return (
    <div
      className={cx(styles.playlist, {
        [styles.mini]: mode === "mini",
        [styles.small]: mode === "condensed",
        [styles.full]: mode === "full",
      })}
    >
      <section className={styles.panel}>
        <PlaylistPlayer />

        <div className={styles.titles}>
          {mode === "full" ? (
            <PlaylistItems />
          ) : (
            <p
              className={styles.playing}
              onClick={() => onSetMode(mode === "mini" ? "condensed" : "full")}
              title={mode === "mini" ? activeFile?.filename : ""}
            >
              {activeFile?.filename}
            </p>
          )}
        </div>
      </section>

      {mode !== "mini" ? (
        <FaChevronDown
          className={styles.shrinkIcon}
          onClick={() => onSetMode(mode === "condensed" ? "mini" : "condensed")}
        />
      ) : null}

      {mode !== "full" ? (
        <FaChevronUp
          className={styles.modeIcon}
          onClick={() => onSetMode(mode === "condensed" ? "full" : "condensed")}
        />
      ) : null}
    </div>
  );
};

const PlaylistItems: FC = () => {
  const {
    files: playlist,
    setFiles: setPlaylist,
    removeFile,
    activeFile,
    setActiveFile,
  } = useMediaListContext();

  const [parentRef, values] = useDragAndDrop<HTMLDivElement, FileInfo>(
    playlist,
    {
      sortable: true,
      onSort: (data) => {
        setPlaylist(data.values as FileInfo[]);
      },
      plugins: [
        insert({
          insertPoint: () => {
            const div = document.createElement("div");
            div.classList.add(styles.dndInsert);
            return div;
          },
        }),
      ],
    }
  );

  return (
    <section ref={parentRef}>
      {values.map((item, idx) => {
        const isCurrentItem = item.fullPath === activeFile?.fullPath;
        return (
          <div className={styles.playlistItem} key={item.fullPath}>
            <AiOutlineClose onClick={() => removeFile(item)} />
            <p
              className={cx({
                [styles.playing]: isCurrentItem,
              })}
              onDoubleClick={() => setActiveFile(playlist[idx])}
            >
              {item.filename}
            </p>
          </div>
        );
      })}
    </section>
  );
};
