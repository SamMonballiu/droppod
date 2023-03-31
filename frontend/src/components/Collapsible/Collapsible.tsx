import React, { FC, ReactNode } from "react";

interface Props extends React.PropsWithChildren {
  collapsed: boolean;
  collapseButton?: ReactNode;
  expandButton: ReactNode;
}

//@ts-ignore
export const Collapsible: FC<Props> = ({
  collapsed,
  collapseButton,
  expandButton,
  children,
}) => {
  return collapsed ? (
    expandButton
  ) : (
    <>
      {collapseButton}
      {children}
    </>
  );
};
