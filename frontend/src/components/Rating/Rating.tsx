import { FC, useEffect, useState } from "react";
import { AiFillStar } from "react-icons/ai";
import { FileRating, SetFileRatingPostmodel } from "@models/post";
import styles from "./Rating.module.scss";
import cx from "classnames";
import axios from "axios";
import { useMutation } from "react-query";
import { FileInfo } from "@models/fileinfo";

interface Props {
  file: FileInfo;
  readonly?: boolean;
  noHollowStars?: boolean;
  className?: string;
}

export const Rating: FC<Props> = ({
  file,
  readonly,
  noHollowStars,
  className,
}) => {
  const [tempValue, setTempValue] = useState<number>(0);
  const [ratingOverride, setRatingOverride] = useState<number | undefined>(
    undefined
  );

  useEffect(() => {
    if (ratingOverride !== undefined) {
      file.rating = ratingOverride as FileRating;
    }
  }, [ratingOverride]);

  useEffect(() => {
    setRatingOverride(undefined);
    setTempValue(0);
  }, [file]);

  const baseUrl = import.meta.env.DEV
    ? window.location.href.replace("5173", "4004")
    : window.location.href;

  const rate = useMutation(async (postmodel: SetFileRatingPostmodel) => {
    const url = baseUrl + "rate-file";
    return (await axios.post(url, postmodel)).data;
  });

  const relevantRating = ratingOverride ?? file.rating ?? 0;

  const getStars = () => {
    const values = Array.from(Array(5).keys());
    return values.map((v) => (
      <AiFillStar
        className={cx({
          [styles.star]: relevantRating >= v + 1,
          [styles.hollow]:
            !noHollowStars &&
            (relevantRating < v + 1 || (tempValue > 0 && tempValue <= v + 1)),
          [styles.blue]: !readonly && tempValue > 0 && tempValue >= v + 1,
          [styles.hidden]: noHollowStars && relevantRating < v + 1,
        })}
        onMouseOver={readonly ? undefined : () => setTempValue(v + 1)}
        onMouseLeave={readonly ? undefined : () => setTempValue(0)}
        onClick={async () => {
          if (readonly) {
            return;
          }
          const newRating = relevantRating === v + 1 ? 0 : v + 1;
          setRatingOverride(newRating);
          await rate.mutateAsync({
            filename: file.filename,
            path: file.relativePath,
            rating: newRating as FileRating,
          });
        }}
        key={v}
      />
    ));
  };

  return <div className={cx(className, styles.rating)}>{getStars()}</div>;
};
