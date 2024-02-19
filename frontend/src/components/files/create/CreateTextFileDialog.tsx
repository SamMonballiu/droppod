import { ButtonDefinition, Dialog, DialogProps } from "@components";
import { FC, useState } from "react";
import { TextPreview } from "../preview/TextPreview/TextPreview";
import styles from "./CreateTextFileDialog.module.scss";
import global from "@root/global.module.scss";
import cx from "classnames";

interface Props extends DialogProps {
  onSubmit: (filename: string, contents: string) => Promise<void>;
  isSubmitting: boolean;
}

export const CreateTextFileDialog: FC<Props> = ({
  onSubmit,
  isSubmitting,
  ...props
}) => {
  const [filename, setFilename] = useState<string>("");
  const [contents, setContents] = useState<string>("");

  const buttons: ButtonDefinition[] = [
    {
      label: "Cancel",
      className: cx(global.btn, global.plain),
      onClick: props.onClose,
      disabled: isSubmitting,
    },
    {
      label: "Create",
      className: global.btn,
      onClick: () => onSubmit(filename + ".txt", contents),
      disabled: isSubmitting || true,
      variant: "primary",
    },
  ];

  return (
    <Dialog {...props} buttons={buttons} title="New text file">
      <div className={styles.container}>
        <div className={styles.filename}>
          <label htmlFor="foldername">Name:</label>
          <input
            id="foldername"
            autoFocus
            type="text"
            value={filename}
            onChange={(e) => setFilename(e.target.value)}
          />
          <span className={styles.suffix}>.txt</span>
        </div>
        <TextPreview isEdit value={contents} onChange={setContents} />
      </div>
    </Dialog>
  );
};
