import { FC, useState } from "react";
import { Dialog } from "@components";
import styles from "./CreateFolderDialog.module.scss";
import global from "@root/global.module.scss";

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

  return (
    <Dialog isOpen={true} onClose={onClose} title="New folder">
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
        <button className={global.btn} onClick={handleSubmit}>
          Create
        </button>
      </div>
    </Dialog>
  );
};
