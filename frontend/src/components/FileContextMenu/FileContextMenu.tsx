import { FileInfo } from "@models/fileinfo";
import { FC } from "react";
import ContextMenu, { ContextHandler } from "../ContextMenu/ContextMenu";

export type FileContextHandler = ContextHandler<FileInfo>;

interface Props extends React.PropsWithChildren {
  file: FileInfo;
  handlers: FileContextHandler[];
}

const FileContextMenu: FC<Props> = ({ file, children, handlers }) => {
  return (
    <ContextMenu
      context={file}
      handlers={handlers}
      getId={(file: FileInfo) => `ctx-${file.filename}`}
    >
      {children}
    </ContextMenu>
  );
};

export default FileContextMenu;
