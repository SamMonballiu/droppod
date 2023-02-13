import { FC, useEffect, useRef, useState } from "react";
import { FileInfo } from "../../../models/fileinfo";
import ImagePreview from "../ImagePreview.tsx/ImagePreview";
import styles from "./Gallery.module.scss";
import cx from "classnames";
import FileProperties from "../FileProperties/FileProperties";
import { ImCross } from "react-icons/im";
import { BiCaretLeft, BiCaretRight } from "react-icons/bi";

interface Props {
  files: FileInfo[];
  onClose: () => void;
}

const Gallery: FC<Props> = ({ files, onClose }) => {
  const [selectedFile, setSelectedFile] = useState<number>(0);
  const thumbnailsRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowLeft":
          handleNavigate("left");
          break;
        case "ArrowRight":
          handleNavigate("right");
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

  const handleNavigate = (direction: "left" | "right") => {
    setSelectedFile((currentIndex) => {
      let newIndex: number;
      switch (direction) {
        case "left":
          newIndex = currentIndex === 0 ? files.length - 1 : currentIndex - 1;
          break;
        case "right":
          newIndex = currentIndex === files.length - 1 ? 0 : currentIndex + 1;
          break;
      }
      return newIndex;
    });
  };

  return (
    <>
      <ImCross className={styles.close} onClick={onClose} />
      <div className={styles.backdrop}></div>
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.topRow}>
            <div className={styles.activeImage}>
              <BiCaretLeft onClick={() => handleNavigate("left")} />
              <ImagePreview dimension={1400} file={files[selectedFile]} />
              <BiCaretRight onClick={() => handleNavigate("right")} />
            </div>
            <div className={styles.fileInfo}>
              <FileProperties
                file={files[selectedFile]}
                properties={["filename", "dimensions", "size", "fullPath"]}
                className={styles.info}
              />
            </div>
          </div>
          <div className={styles.thumbnails} ref={thumbnailsRef}>
            {files.map((f) => (
              <div
                onClick={() => setSelectedFile(files.indexOf(f))}
                key={f.filename}
                id={files.indexOf(f).toString()}
              >
                <ImagePreview
                  file={f}
                  square
                  dimension={300}
                  className={cx(styles.thumbnail, {
                    [styles.selected]: files.indexOf(f) === selectedFile,
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
