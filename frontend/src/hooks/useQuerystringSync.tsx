import { useState, useEffect } from "react";
import { useQuerystring } from "./useQuerystring";

interface QuerystringParser<T> {
  fromString: (str: string | null) => T;
  toString: (value: T | undefined) => string;
}

type ToStringable = {
  toString: () => string;
};

export function useQuerystringSync<T extends ToStringable | undefined>(
  key: string,
  fallbackValue?: T,
  parser?: QuerystringParser<T>
): readonly [T, React.Dispatch<React.SetStateAction<T>>] {
  const querystring = useQuerystring();
  const initialValue =
    typeof fallbackValue === "string"
      ? querystring.get(key) ?? fallbackValue!
      : Array.isArray(fallbackValue)
      ? parser?.fromString(querystring.get(key)) ??
        querystring.get(key)?.split(",") ??
        fallbackValue
      : parser?.fromString(querystring.get(key)) ?? fallbackValue!;
  const [value, setValue] = useState<T>(initialValue);

  useEffect(() => {
    querystring.update(key, parser?.toString(value) ?? value?.toString() ?? "");
  }, [value]);

  return [value, setValue] as const;
}
