import React, { FC } from "react";
import styles from "./Paper.module.scss";

const Paper: FC<React.PropsWithChildren> = ({ children }) => {
  return <div className={styles.container}>{children}</div>;
};

export default Paper;
