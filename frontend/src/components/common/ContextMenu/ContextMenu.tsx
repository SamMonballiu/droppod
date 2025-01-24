import {
  ContextMenuTrigger,
  ContextMenu as RctxContextMenu,
  ContextMenuItem,
} from "rctx-contextmenu";
import { useMemo } from "react";

import styles from "./ContextMenu.module.scss";

export type ContextHandler<T> = {
  icon?: React.ReactNode;
  label: string;
  disabled?: boolean;
  condition?: (item: T) => boolean;
  onClick?: (context: T) => void;
};

interface Props<T> extends React.PropsWithChildren {
  context: T;
  getId: (context: T) => string;
  handlers: ContextHandler<T>[];
  triggerClassName?: string;
}

export const ContextMenu = <T,>({
  context,
  handlers = [],
  children,
  getId,
  triggerClassName,
}: Props<T>) => {
  const items = useMemo(() => {
    return handlers.map((h) => (
      <ContextMenuItem
        key={h.label}
        onClick={() => h.onClick?.(context)}
        disabled={h.disabled}
        className={styles.menuItem}
      >
        {h.icon ?? <div className={styles.placeholder}></div>}
        <span>{h.label}</span>
      </ContextMenuItem>
    ));
  }, [context, handlers]);

  if (items.length === 0) {
    return children;
  }

  return (
    <>
      <ContextMenuTrigger className={triggerClassName} id={getId(context)}>
        {children}
      </ContextMenuTrigger>

      <RctxContextMenu id={getId(context)}>{items}</RctxContextMenu>
    </>
  );
};
