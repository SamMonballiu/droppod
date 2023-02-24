import { FC, useState } from "react";
import { AiFillStar } from "react-icons/ai";
import { FileRating } from "../../../models/post";
import styles from "./Rating.module.scss";
import cx from "classnames";

interface Props {
  value: FileRating;
  onClickValue: (value: number) => void;
}

const Rating: FC<Props> = ({ value, onClickValue }) => {
  const [tempValue, setTempValue] = useState<number>(0);

  const getStars = () => {
    const values = Array.from(Array(5).keys());
    return values.map((v) => (
      <AiFillStar
        className={cx({
          [styles.star]: value >= v + 1,
          [styles.hollow]:
            value < v + 1 || (tempValue > 0 && tempValue <= v + 1),
          [styles.blue]: tempValue > 0 && tempValue >= v + 1,
        })}
        onMouseOver={() => setTempValue(v + 1)}
        onMouseLeave={() => setTempValue(0)}
        onClick={() => onClickValue(tempValue)}
        key={v}
      />
    ));
  };

  return <div className={styles.rating}>{getStars()}</div>;
};

export default Rating;
