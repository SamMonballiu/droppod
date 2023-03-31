import { Dialog, DialogProps } from "@components";
import { FC, useState } from "react";
import styles from "./RenameDialog.module.scss";
import global from "../../global.module.scss";

interface Props extends Omit<DialogProps, "title" | "children" | "buttons"> {
  currentName: string;
  validateName: (name: string) => { isValid: boolean; reason?: string };
  onConfirm: (newName: string) => void;
}

export const RenameDialog: FC<Props> = ({
  currentName,
  validateName,
  onConfirm,
  ...dialogProps
}) => {
  const [newName, setNewName] = useState(currentName);
  const [validationMessage, setValidationMessage] = useState<
    string | undefined
  >(undefined);

  const handleConfirm = () => {
    setValidationMessage(undefined);
    const validation = validateName(newName);

    if (validation.isValid) {
      onConfirm(newName);
    } else {
      setValidationMessage(validation.reason);
    }
  };

  return (
    <Dialog
      title="Rename"
      {...dialogProps}
      buttons={[
        {
          label: "Cancel",
          onClick: dialogProps.onClose,
          className: global.secondaryButton,
        },
        {
          label: "OK",
          onClick: handleConfirm,
          className: global.primaryButton,
        },
      ]}
    >
      <div className={styles.renameDialog}>
        <div className={styles.input}>
          <label htmlFor="rename">New name:</label>
          <input
            id="rename"
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
        </div>
        {validationMessage !== undefined && (
          <p className={styles.validationMessage}>{validationMessage}</p>
        )}
      </div>
    </Dialog>
  );
};
