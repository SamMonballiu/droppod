import { FC, useEffect, useMemo, useRef, useState } from "react";
import { FileInfo } from "../../../models/fileinfo";
import ImagePreview from "../ImagePreview.tsx/ImagePreview";
import styles from "./Gallery.module.scss";
import cx from "classnames";
import FileProperties from "../FileProperties/FileProperties";
import { ImCross } from "react-icons/im";
import {
  BiCaretLeft,
  BiCaretRight,
  BiFullscreen,
  BiChevronsUp,
  BiChevronsDown,
} from "react-icons/bi";
import { useListSelection } from "../hooks/useListSelection";
import Thumbnail from "../Thumbnail/Thumbnail";

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

  const { getThumbnail, thumbnails } = useMemo(() => {
    const getThumbnail = (file: FileInfo, isSelected: boolean) => {
      return (
        <Thumbnail
          file={file}
          onClick={() => selectItem(file)}
          key={files.indexOf(file).toString()}
          id={files.indexOf(file).toString()}
          className={cx(styles.thumbnail, {
            [styles.selected]: isSelected,
            [styles.thumbnailZoom]: showLargeThumbnails,
          })}
        />
      );
    };

    const thumbnails = files.map((f) => {
      return {
        file: f,
        element: getThumbnail(f, false),
      };
    });

    return { getThumbnail, thumbnails };
  }, [files, showLargeThumbnails]);

  return (
    <div ref={galleryRef}>
      <div className={styles.icons}>
        <BiFullscreen
          className={styles.fullscreen}
          onClick={() => setIsFullscreen(!isFullscreen)}
        />
        <ImCross className={styles.close} onClick={onClose} />
      </div>

      <div className={styles.backdrop}></div>

      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.topRow}>
            <div className={styles.thumbnailsZoom}>
              <div onClick={toggleThumbnailZoom}>
                {showLargeThumbnails ? <BiChevronsDown /> : <BiChevronsUp />}
              </div>
            </div>
            <div className={styles.activeImage}>
              <BiCaretLeft onClick={() => select("previous")} />
              <ImagePreview dimension={1400} file={selectedItem} />
              <BiCaretRight onClick={() => select("next")} />
            </div>
            <div className={styles.fileInfo}>
              <FileProperties
                file={selectedItem}
                properties={["filename", "dimensions", "size", "fullPath"]}
                className={styles.info}
              />
            </div>
          </div>

          <div className={styles.thumbnails} ref={thumbnailsRef}>
            {files.map((f) =>
              isSelected(f)
                ? getThumbnail(f, true)
                : thumbnails.find((x) => x.file === f)!.element
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Gallery;
