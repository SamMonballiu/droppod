import { FC } from "react";
import styles from "./Loading.module.scss";
import cx from "classnames";
import { MdHourglassEmpty } from "react-icons/md";

interface Props {
  animated?: boolean;
  className?: string;
}
export const Loading: FC<Props> = ({ animated, className }) => {
  return (
    <div
      className={cx(className, styles.loading, { [styles.animated]: animated })}
    >
      <MdHourglassEmpty className={styles.icon} />
    </div>
  );
};
