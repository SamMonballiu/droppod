import React, { FC } from "react";
import styles from "./Paper.module.scss";

export const Paper: FC<React.PropsWithChildren> = ({ children }) => {
  return <div className={styles.container}>{children}</div>;
};
