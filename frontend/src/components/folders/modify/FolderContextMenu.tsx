import { ContextHandler, ContextMenu } from "@components";
import { FolderInfo } from "@models/folderInfo";
import { FC } from "react";

export type FolderContextHandler = ContextHandler<FolderInfo>;

interface Props extends React.PropsWithChildren {
  folder: FolderInfo;
  handlers: FolderContextHandler[];
}

export const FolderContextMenu: FC<Props> = ({
  folder,
  children,
  handlers,
}) => {
  return (
    <ContextMenu
      context={folder}
      handlers={handlers}
      getId={(context) => `ctx-${context.name}`}
    >
      {children}
    </ContextMenu>
  );
};
