import { Dialog, DialogButtonDefinition, DialogProps } from "@components";
import { FC, useState } from "react";
import { TextPreview } from "../preview/TextPreview/TextPreview";
import styles from "./CreateTextFileDialog.module.scss";
import global from "@root/global.module.scss";
import cx from "classnames";
import {
  BooleanContextProvider,
  useBooleanContext,
} from "@root/context/useBooleanContext";

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

  const buttons: DialogButtonDefinition[] = [
    {
      label: "Cancel",
      className: cx(global.btn, global.plain),
      type: "cancel",
      disabled: isSubmitting,
    },
    {
      label: "Create",
      className: global.btn,
      onClick: () => onSubmit(filename + ".txt", contents),
      disabled: isSubmitting || filename === "" || contents === "",
      variant: "primary",
    },
  ];

  return (
    <BooleanContextProvider>
      <Dialog {...props} buttons={buttons} title="New text file">
        <CreateTextFile
          filename={{ value: filename, set: setFilename }}
          contents={{ value: contents, set: setContents }}
        />
      </Dialog>
    </BooleanContextProvider>
  );
};

type Setter<T> = {
  value: T;
  set: (value: T) => void;
};
interface CreateProps {
  filename: Setter<string>;
  contents: Setter<string>;
}

const CreateTextFile: FC<CreateProps> = ({ filename, contents }) => {
  const isDirty = useBooleanContext();

  return (
    <div className={styles.container}>
      <div className={styles.filename}>
        <label htmlFor="foldername">Name:</label>
        <input
          id="foldername"
          autoFocus
          type="text"
          value={filename.value}
          onChange={(e) => filename.set(e.target.value)}
        />
        <span className={styles.suffix}>.txt</span>
      </div>
      <TextPreview
        isEdit
        value={contents.value}
        onChange={(value: string) => {
          contents.set(value);
          isDirty?.setValue(true);
        }}
      />
    </div>
  );
};
