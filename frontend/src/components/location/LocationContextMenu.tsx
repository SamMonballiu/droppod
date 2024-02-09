import { ContextHandler, ContextMenu } from "@components";
import { FolderInfo } from "@models/folderInfo";
import { FC } from "react";
import styles from "./LocationContextMenu.module.scss";

export type LocationContextHandler = ContextHandler<FolderInfo>;

interface Props extends React.PropsWithChildren {
  location: FolderInfo;
  handlers: LocationContextHandler[];
}

export const LocationContextMenu: FC<Props> = ({
  location,
  handlers,
  children,
}) => {
  return (
    <ContextMenu
      context={location}
      handlers={handlers}
      getId={(location: FolderInfo) => `ctx-${location.name}`}
      triggerClassName={styles.trigger}
    >
      {children}
    </ContextMenu>
  );
};
