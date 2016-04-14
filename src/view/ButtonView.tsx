import * as React from "react";

interface ButtonViewProps {
  checked?: boolean;
  onClick?: () => void;
  kind: String;
}

const ButtonView = (props: ButtonViewProps) => {
  const {checked, onClick, kind} = props;
  const className = `sg-button sg-button-${kind} ${checked ? "checked" : ""}`
  return (
    <button className={className} onClick={onClick}></button>
  );
}
export default ButtonView;
