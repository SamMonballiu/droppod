import { Dialog as HeadlessDialog } from "@headlessui/react";
import React, { FC, useRef } from "react";
import styles from "./Dialog.module.scss";
import global from "@root/global.module.scss";
import cx from "classnames";
import { useBooleanContext } from "@root/context/useBooleanContext";

export interface ButtonDefinition {
  label: string;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "plain" | "primary";
}

export interface DialogButtonDefinition extends ButtonDefinition {
  type?: "cancel";
}

export interface DialogProps extends React.PropsWithChildren {
  title?: string;
  isOpen: boolean;
  onClose: () => void;
  buttons?: DialogButtonDefinition[];
}

export const Dialog: FC<DialogProps> = ({
  title,
  isOpen,
  onClose,
  children,
  buttons,
}) => {
  const isDirty = useBooleanContext();
  const dialogRef = useRef<HTMLElement | undefined>();
  const backdropRef = useRef<HTMLElement | undefined>();

  const handleClose = () => {
    if (
      !isDirty ||
      !isDirty.value ||
      (isDirty.value && confirm("Discard unsaved changes?"))
    ) {
      dialogRef.current?.classList.add(styles.closePanel);
      backdropRef.current?.classList.add(styles.closeBackdrop);
      setTimeout(onClose, 200);
    }
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
                      [global.disabled]: btn.disabled,
                    },
                    btn.className
                  )}
                  onClick={
                    btn?.onClick ??
                    (btn.type === "cancel" ? () => handleClose() : undefined)
                  }
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
