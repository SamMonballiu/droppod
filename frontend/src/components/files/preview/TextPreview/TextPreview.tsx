import { FileInfo } from "@models/fileinfo";
import axios from "axios";
import { FC, useState, useEffect } from "react";
import { useQuery } from "react-query";
import styles from "./TextPreview.module.scss";
import {
  MdSave,
  MdHourglassEmpty,
  MdCheck,
  MdErrorOutline,
} from "react-icons/md";
import cx from "classnames";

interface Props {
  file?: FileInfo;
  isEdit?: boolean;
  value?: string;
  onChange?: (value: string) => void;
  onSave?: (filename: string, contents: string) => Promise<void>;
}

export const TextPreview: FC<Props> = ({
  file,
  isEdit,
  value,
  onChange,
  onSave,
}) => {
  const [text, setText] = useState(value ?? "");
  useEffect(() => {
    onChange?.(text);
  }, [text]);

  const { isFetching } = useQuery(
    ["files", file],
    async () => {
      return await axios.get("/files/contents?path=" + file!.fullPath);
    },
    {
      enabled: file !== undefined,
      onSuccess: (resp) => setText(resp.data),
    }
  );

  return isFetching ? null : (
    <div className={styles.contents}>
      {isEdit ? (
        <textarea value={text} onChange={(e) => setText(e.target.value)} />
      ) : (
        <p>{text}</p>
      )}
      {onSave && isEdit && (
        <AsyncButton
          promise={() => onSave(file?.filename ?? "", text)}
          icon={MdSave}
        />
      )}
    </div>
  );
};

interface AsyncButtonProps {
  promise: () => Promise<any>;
  icon: FC;
}
const AsyncButton: FC<AsyncButtonProps> = ({ promise, icon: DefaultIcon }) => {
  const [state, setState] = useState<"init" | "loading" | "success" | "error">(
    "init"
  );

  const handleClick = async () => {
    setState("loading");
    promise()
      .then(() => setState("success"))
      .catch(() => setState("error"));
  };

  useEffect(() => {
    if (state === "success") {
      setTimeout(() => setState("init"), 5000);
    }
  }, [state]);

  const props = {
    className: cx(styles.save, styles[state]),
    onClick: handleClick,
  };

  switch (state) {
    case "loading":
      return <MdHourglassEmpty {...props} />;
    case "error":
      return (
        <MdErrorOutline
          {...props}
          title="Something went wrong. Click to try again."
        />
      );
    case "success":
      return <MdCheck {...props} />;
    default:
      return <DefaultIcon {...props} />;
  }
};
