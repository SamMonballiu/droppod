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
  onClick?: (context: T) => void;
};

interface Props<T> extends React.PropsWithChildren {
  context: T;
  getId: (context: T) => string;
  handlers: ContextHandler<T>[];
}

export const ContextMenu = <T,>({
  context,
  handlers = [],
  children,
  getId,
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
      <ContextMenuTrigger id={getId(context)}>{children}</ContextMenuTrigger>

      <RctxContextMenu id={getId(context)}>{items}</RctxContextMenu>
    </>
  );
};
