import React, { FC, useEffect, useRef, useState } from "react";
import { FileInfo } from "../../../../models/fileinfo";
import ImagePreview from "../../ImagePreview.tsx/ImagePreview";
import styles from "./Gallery.module.scss";
import cx from "classnames";
import FileProperties from "../FileProperties/FileProperties";
import {
  BiFullscreen,
  BiChevronsUp,
  BiChevronsDown,
  BiExit,
} from "react-icons/bi";
import { useListSelection } from "../../hooks/useListSelection";
import neutral from "./Gallery.neutral.module.scss";
import { useThumbnails } from "../../hooks/useThumbnails";

interface Props {
  files: FileInfo[];
  onClose: () => void;
}

const Gallery: FC<Props> = ({ files, onClose }) => {
  const thumbnailsRef = useRef<HTMLDivElement | null>(null);
  const galleryRef = useRef<HTMLDivElement | null>(null);

  const { selectedItem, select, selectItem, isSelected } =
    useListSelection(files);

  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showLargeThumbnails, setShowLargeThumbnails] = useState<boolean>(true);
  const [mode, setMode] = useState<"dark" | "neutral">("neutral");

  const toggleThumbnailZoom = () =>
    setShowLargeThumbnails(!showLargeThumbnails);

  useEffect(() => {
    if (isFullscreen) {
      galleryRef.current?.requestFullscreen();
    } else {
      if (document.fullscreenElement !== null) {
        document.exitFullscreen();
      }
    }
  }, [isFullscreen]);

  useEffect(() => {
    const onKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowLeft":
          select("previous");
          break;
        case "ArrowRight":
          select("next");
          break;
      }
    };

    const scrollAmount = Math.max(30, files.length * 0.25);
    const onThumbnailScroll = (event: WheelEvent) => {
      event.preventDefault();

      thumbnailsRef.current?.scrollBy({
        left: event.deltaY < 0 ? -scrollAmount : scrollAmount,
      });
    };

    document.addEventListener("keydown", onKeyPress);
    thumbnailsRef.current?.addEventListener("wheel", onThumbnailScroll);

    return () => {
      document.removeEventListener("keydown", onKeyPress);
      thumbnailsRef.current?.addEventListener("wheel", onThumbnailScroll);
    };
  }, []);

  useEffect(() => {
    document
      .getElementById(files.indexOf(selectedItem).toString())
      ?.scrollIntoView({ behavior: "auto", block: "end", inline: "center" });
  }, [selectedItem]);

  const { thumbnails } = useThumbnails(files, selectItem);

  const handleModeSwitch = () => {
    setMode(mode === "neutral" ? "dark" : "neutral");
  };

  const modeDependent: Record<string, string> = {
    backdrop: cx(styles.backdrop, { [neutral.backdrop]: mode === "neutral" }),
    icons: cx(styles.icons, {
      [neutral.icons]: mode === "neutral",
    }),
    thumbnails: cx(styles.thumbnails, {
      [neutral.thumbnails]: mode === "neutral",
    }),
    info: cx(styles.info, { [neutral.info]: mode === "neutral" }),
    activeImage: cx(styles.activeImage, {
      [neutral.activeImage]: mode === "neutral",
    }),
    modeToggle: cx(styles.modeToggle, {
      [neutral.modeToggle]: mode === "neutral",
    }),
  };

  return (
    <div ref={galleryRef}>
      <div className={modeDependent.icons}>
        <div
          className={modeDependent.modeToggle}
          onClick={handleModeSwitch}
        ></div>
        <BiFullscreen
          className={styles.fullscreen}
          onClick={() => setIsFullscreen(!isFullscreen)}
        />
        <BiExit className={styles.close} onClick={onClose} />
      </div>

      <div className={modeDependent.backdrop}></div>

      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.topRow}>
            <div className={modeDependent.activeImage}>
              <div className={styles.navigators}>
                <div onClick={() => select("previous")}></div>
                <div onClick={() => select("next")}></div>
              </div>
              <div className={styles.image}>
                <ImagePreview dimension={1000} file={selectedItem} />
              </div>
            </div>
            <div className={styles.fileInfo}>
              <FileProperties
                file={selectedItem}
                properties={[
                  "filename",
                  "rating",
                  "dimensions",
                  "size",
                  "fullPath",
                ]}
                className={modeDependent.info}
              />
            </div>
          </div>

          <div className={modeDependent.thumbnails} ref={thumbnailsRef}>
            <div className={styles.thumbnailsZoom}>
              <div onClick={toggleThumbnailZoom}>
                {showLargeThumbnails ? <BiChevronsDown /> : <BiChevronsUp />}
              </div>
            </div>
            {files.map((f) => {
              return (
                <div
                  key={f.filename}
                  className={cx(styles.thumbnail, {
                    [styles.largeThumbnail]: showLargeThumbnails,
                    [styles.selected]: isSelected(f),
                  })}
                >
                  {thumbnails.find((x) => x.file === f)!.element}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

const areEqual = (first: Props, second: Props) => {
  const filesInDifferentOrder = first.files.some(
    (x) => second.files.indexOf(x) !== first.files.indexOf(x)
  );

  return !filesInDifferentOrder;
};

export const MemoizedGallery = React.memo(Gallery, areEqual);
