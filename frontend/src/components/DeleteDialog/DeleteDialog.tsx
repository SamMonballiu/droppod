import { FC } from "react";
import { Dialog, DialogProps } from "@components";
import global from "@root/global.module.scss";

interface Props extends Omit<DialogProps, "title" | "children" | "buttons"> {
  mode: "folder" | "file";
  names: string[];
  onConfirm: (names: string[]) => void;
}

export const DeleteDialog: FC<Props> = ({
  names,
  mode,
  onConfirm,
  ...dialogProps
}) => {
  const msg =
    names.length === 1
      ? `Are you sure you want to delete the ${mode} '${names[0]}'?`
      : "Are you sure you want to delete the following files?";

  return (
    <Dialog
      title="Delete"
      {...dialogProps}
      buttons={[
        {
          label: "No",
          onClick: dialogProps.onClose,
          className: global.primaryButton,
        },
        {
          label: "Yes",
          onClick: () => onConfirm(names),
          className: global.secondaryButton,
        },
      ]}
    >
      <div>
        <p>{msg}</p>
        {mode === "file" && names.length > 1 ? (
          <ul>
            {names.map((nm) => (
              <li key={nm}>{nm}</li>
            ))}
          </ul>
        ) : null}
        <p>{names.length === 1 ? "It" : "They"} will be permanently removed.</p>
      </div>
    </Dialog>
  );
};
