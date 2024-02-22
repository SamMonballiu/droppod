import { createContext, useContext, useState, FC } from "react";

interface BooleanContextData {
  value: boolean;
  setValue: (value: boolean) => void;
}

const BooleanContext = createContext<BooleanContextData | null>(null);

export function useBooleanContext(): BooleanContextData {
  //@ts-ignore
  return useContext(BooleanContext);
}

export const BooleanContextProvider: FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [value, setValue] = useState(false);

  return (
    <BooleanContext.Provider value={{ value, setValue }}>
      {children}
    </BooleanContext.Provider>
  );
};
