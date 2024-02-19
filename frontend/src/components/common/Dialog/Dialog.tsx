import { Dialog as HeadlessDialog } from "@headlessui/react";
import React, { FC, useRef } from "react";
import styles from "./Dialog.module.scss";
import global from "@root/global.module.scss";
import cx from "classnames";

export interface ButtonDefinition {
  label: string;
  className?: string;
  onClick: () => void;
  disabled?: boolean;
  variant?: "plain" | "primary";
}

export interface DialogProps extends React.PropsWithChildren {
  title?: string;
  isOpen: boolean;
  onClose: () => void;
  buttons?: ButtonDefinition[];
}

export const Dialog: FC<DialogProps> = ({
  title,
  isOpen,
  onClose,
  children,
  buttons,
}) => {
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
          {buttons && (
            <div className={styles.buttons}>
              {buttons.map((btn) => (
                <button
                  key={btn.label}
                  disabled={btn.disabled ?? false}
                  className={cx(
                    global.btn,
                    {
                      [global.primary]: btn.variant === "primary",
                      [global.plain]: !btn.variant || btn.variant === "plain",
                    },
                    btn.className
                  )}
                  onClick={btn.onClick}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          )}
        </HeadlessDialog.Panel>
      </div>
    </HeadlessDialog>
  );
};
