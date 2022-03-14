import React, { FC } from "react";

interface Props {
  children: any;
}

const LogoContainer: FC<Props> = (props: Props): JSX.Element => {
  const { children } = props;

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        marginBottom: "1em",
      }}
    >
      {children}
    </div>
  );
};

export default LogoContainer;
