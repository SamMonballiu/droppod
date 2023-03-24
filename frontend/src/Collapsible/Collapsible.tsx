import React, { FC, ReactNode } from "react";

interface Props extends React.PropsWithChildren {
  collapsed: boolean;
  collapseButton?: ReactNode;
  expandButton: ReactNode;
}

//@ts-ignore
const Collapsible: FC<Props> = ({
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

export default Collapsible;
