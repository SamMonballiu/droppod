import React, { FC, ReactNode } from "react";

interface Props {
  collapsed: boolean;
  collapseButton?: ReactNode;
  expandButton: ReactNode;
}

//@ts-ignore
const Collapsible: FC<Props> = ({
  collapsed,
  collapseButton,
  expandButton,
  //@ts-ignore
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

export default Collapsible;
