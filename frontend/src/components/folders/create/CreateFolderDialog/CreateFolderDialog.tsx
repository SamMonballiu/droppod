import { FC, useState } from "react";
import { ButtonDefinition, Dialog } from "@components";
import styles from "./CreateFolderDialog.module.scss";

interface Props {
  onClose: () => void;
  onSubmit?: (folderName: string) => Promise<Response>;
}

export const CreateFolderDialog: FC<Props> = ({ onClose, onSubmit }) => {
  const [name, setName] = useState<string>("");

  const handleSubmit = async () => {
    const result = await onSubmit?.(name);
    if (result?.ok) {
      onClose();
    }
  };

  const buttons: ButtonDefinition[] = [
    { label: "Cancel", onClick: onClose, variant: "plain" },
    {
      label: "Create",
      onClick: handleSubmit,
      variant: "primary",
    },
  ];

  return (
    <Dialog
      isOpen={true}
      onClose={onClose}
      buttons={buttons}
      title="New folder"
    >
      <div className={styles.container}>
        <div className={styles.folderName}>
          <label htmlFor="foldername">Name:</label>
          <input
            id="foldername"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
      </div>
    </Dialog>
  );
};
