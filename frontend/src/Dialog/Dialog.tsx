import { Dialog as HeadlessDialog } from "@headlessui/react";
import React, { FC } from "react";
import styles from "./Dialog.module.scss";

interface DialogProps extends React.PropsWithChildren {
  title?: string;
  isOpen: boolean;
  onClose: () => void;
}

const Dialog: FC<DialogProps> = ({ title, isOpen, onClose, children }) => {
  return (
    <HeadlessDialog
      open={isOpen}
      onClose={onClose}
      className={styles.dialogRoot}
    >
      <div className={styles.backdrop}>&nbsp;</div>

      <div className={styles.dialog}>
        <HeadlessDialog.Panel className={styles.panel}>
          {title && <HeadlessDialog.Title>{title}</HeadlessDialog.Title>}
          {children}
        </HeadlessDialog.Panel>
      </div>
    </HeadlessDialog>
  );
};

export default Dialog;
