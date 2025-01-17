import { createContext, useContext, useState, FC } from "react";

interface BaseUrlContextData {
  baseUrl: string;
}

const BaseUrlContext = createContext<BaseUrlContextData>({ baseUrl: "" });

export function useBaseUrlContext() {
  return useContext(BaseUrlContext);
}

export const BaseUrlContextProvider: FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const baseUrl =
    (import.meta.env.DEV
      ? window.location.origin.replace("5173", "4004")
      : window.location.origin) + "/";

  return (
    <BaseUrlContext.Provider value={{ baseUrl }}>
      {children}
    </BaseUrlContext.Provider>
  );
};
