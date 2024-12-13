import { useState } from "react";

export interface Toggleable {
  value: boolean;
  set: (value: boolean) => void;
  toggle: () => void;
}

const useToggle = (initialValue: boolean): Toggleable => {
  const [value, setValue] = useState<boolean>(initialValue);
  const toggle = () => setValue(!value);
  const set = (value: boolean) => setValue(value);
  return { value, toggle, set } as const;
};

export default useToggle;
