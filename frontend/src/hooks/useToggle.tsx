import { useState } from "react";

const useToggle = (initialValue: boolean) => {
  const [value, setValue] = useState<boolean>(initialValue);
  const toggle = () => setValue(!value);
  const set = (value: boolean) => setValue(value);
  return {value, toggle, set} as const;
};

export default useToggle;
