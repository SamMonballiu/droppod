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
import { useBooleanContext } from "@root/context/useBooleanContext";
import { useBaseUrlContext } from "@root/context/useBaseUrlContext";

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
  const isDirty = useBooleanContext();
  const { baseUrl } = useBaseUrlContext();
  const [text, setText] = useState(value ?? "");

  const {
    data: response,
    isFetching,
    isFetched,
  } = useQuery(
    ["files", file],
    async () => {
      return await axios.get(baseUrl + "files/contents?path=" + file!.fullPath);
    },
    {
      enabled: file !== undefined,
      onSuccess: (resp) => setText(resp.data),
    }
  );

  useEffect(() => {
    onChange?.(text);
    if (isFetched) {
      isDirty?.setValue(text !== response?.data);
    }
  }, [text]);

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
          onSuccess={() => isDirty?.setValue(false)}
          icon={MdSave}
        />
      )}
    </div>
  );
};

interface AsyncButtonProps {
  promise: () => Promise<any>;
  onSuccess?: () => void;
  icon: FC;
}
const AsyncButton: FC<AsyncButtonProps> = ({
  promise,
  icon: DefaultIcon,
  onSuccess,
}) => {
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
      onSuccess?.();
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
