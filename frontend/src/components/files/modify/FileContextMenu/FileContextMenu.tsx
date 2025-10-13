import { ContextHandler, ContextMenu } from "@components";
import { FileInfo } from "@models/fileinfo";
import { FC } from "react";

export type FileContextHandler = ContextHandler<FileInfo>;

interface Props extends React.PropsWithChildren {
  file: FileInfo;
  handlers: FileContextHandler[];
  getId?: (file: FileInfo) => string;
}

export const FileContextMenu: FC<Props> = ({
  file,
  children,
  handlers,
  getId,
}) => {
  return (
    <ContextMenu
      context={file}
      handlers={handlers.filter((handler) => handler.condition?.(file) ?? true)}
      getId={(file: FileInfo) => getId?.(file) ?? `ctx-${file.filename}`}
    >
      {children}
    </ContextMenu>
  );
};
