import { FC, useEffect, useRef, useState } from "react";
import { FileInfo } from "../../../models/fileinfo";
import ImagePreview from "../ImagePreview.tsx/ImagePreview";
import styles from "./Gallery.module.scss";
import cx from "classnames";
import FileProperties from "../FileProperties/FileProperties";
import { ImCross } from "react-icons/im";
import { BiCaretLeft, BiCaretRight } from "react-icons/bi";
import { useListSelection } from "../hooks/useListSelection";

interface Props {
  files: FileInfo[];
  onClose: () => void;
}

const Gallery: FC<Props> = ({ files, onClose }) => {
  const [selectedFile, setSelectedFile] = useState<number>(0);
  const thumbnailsRef = useRef<HTMLDivElement | null>(null);

  const { selectedItem, select, selectItem, isSelected } =
    useListSelection(files);

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
      .getElementById(selectedFile.toString())
      ?.scrollIntoView({ behavior: "auto", block: "end", inline: "center" });
  }, [selectedFile]);

  return (
    <>
      <ImCross className={styles.close} onClick={onClose} />
      <div className={styles.backdrop}></div>
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.topRow}>
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
            {files.map((f) => (
              <div
                onClick={() => selectItem(f)}
                key={f.filename}
                id={files.indexOf(f).toString()}
              >
                <ImagePreview
                  file={f}
                  square
                  dimension={300}
                  className={cx(styles.thumbnail, {
                    [styles.selected]: isSelected(f),
                  })}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Gallery;
