import { FC, useEffect, useState } from "react";
import { AiFillStar } from "react-icons/ai";
import { SetFileRatingPostmodel } from "@models/post";
import styles from "./Rating.module.scss";
import cx from "classnames";
import axios from "axios";
import { useMutation } from "react-query";
import { FileInfo, FileRatingValue } from "@models/fileinfo";

interface Props {
  file: FileInfo;
  readonly?: boolean;
  noHollowStars?: boolean;
  className?: string;
  onRate?: (rating: FileRatingValue) => Promise<void>;
}

export const FileRating: FC<Props> = (props) => {
  const baseUrl = import.meta.env.DEV
    ? window.location.href.replace("5173", "4004")
    : window.location.href;

  const rate = useMutation(async (postmodel: SetFileRatingPostmodel) => {
    const url = baseUrl + "rate-file";
    return (await axios.post(url, postmodel)).data;
  });

  return (
    <Rating
      {...props}
      value={props.file.rating ?? 0}
      onRate={async (newRating) => {
        props.file.rating = newRating;
        await rate.mutateAsync({
          filename: props.file.filename,
          path: props.file.relativePath,
          rating: newRating,
        });
      }}
    />
  );
};

type RatingProps = Omit<Props, "file"> & { value: FileRatingValue };

export const Rating: FC<RatingProps> = ({
  //file,
  value,
  readonly,
  noHollowStars,
  className,
  onRate,
}) => {
  const [tempValue, setTempValue] = useState<number>(0);
  const [ratingOverride, setRatingOverride] = useState<number | undefined>(
    undefined
  );

  // useEffect(() => {
  //   if (ratingOverride !== undefined) {
  //     file.rating = ratingOverride as FileRating;
  //   }
  // }, [ratingOverride]);

  useEffect(() => {
    setRatingOverride(undefined);
    setTempValue(0);
  }, [value]);

  const relevantRating = ratingOverride ?? value ?? 0;

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

          onRate?.(newRating);
        }}
        key={v}
      />
    ));
  };

  return <div className={cx(className, styles.rating)}>{getStars()}</div>;
};
