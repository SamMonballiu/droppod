import React, { useState, useEffect, FC } from "react";

interface Props {
  value: string;
  onChange: (val: string) => void;
  interval?: number;
}

export const DebouncedTextBox: FC<Props> = ({
  value,
  onChange,
  interval = 200,
}) => {
  const [inputValue, setInputValue] = useState(value);

  let timer: number;

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    setInputValue(newValue);
  };

  useEffect(() => {
    clearTimeout(timer);

    // Set a new timer to update the state after the debounce interval
    timer = setTimeout(() => {
      onChange(inputValue);
    }, interval);

    // Clean up the timer when the component unmounts
    return () => clearTimeout(timer);
  }, [inputValue]);

  return <input type="text" value={inputValue} onChange={handleInputChange} />;
};
