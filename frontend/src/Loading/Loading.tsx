import { FC } from "react";
import styles from "./Loading.module.scss";
import cx from "classnames";
import { MdHourglassEmpty } from "react-icons/md";

const Loading: FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={cx(className, styles.loading)}>
      <MdHourglassEmpty className={styles.icon} />
    </div>
  );
};

export default Loading;
