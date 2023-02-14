import { Dialog as HeadlessDialog } from "@headlessui/react";
import React, { FC, useRef } from "react";
import styles from "./Dialog.module.scss";

interface DialogProps extends React.PropsWithChildren {
  title?: string;
  isOpen: boolean;
  onClose: () => void;
}

const Dialog: FC<DialogProps> = ({ title, isOpen, onClose, children }) => {
  const dialogRef = useRef<HTMLElement | undefined>();
  const backdropRef = useRef<HTMLElement | undefined>();

  const handleClose = () => {
    dialogRef.current?.classList.add(styles.closePanel);
    backdropRef.current?.classList.add(styles.closeBackdrop);
    setTimeout(onClose, 200);
  };

  return (
    <HeadlessDialog
      open={isOpen}
      onClose={handleClose}
      className={styles.dialogRoot}
    >
      <div className={styles.backdrop} ref={backdropRef}>
        &nbsp;
      </div>

      <div className={styles.dialog}>
        <HeadlessDialog.Panel ref={dialogRef} className={styles.panel}>
          {title && <HeadlessDialog.Title>{title}</HeadlessDialog.Title>}
          {children}
        </HeadlessDialog.Panel>
      </div>
    </HeadlessDialog>
  );
};

export default Dialog;
