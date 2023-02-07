import { useState, useCallback } from "react";

const sortBy = <T,>(a: T, b: T, property: keyof T) => {
  return (a[property] ?? 0) < (b[property] ?? 0) ? -1 : 0;
};

export interface SortFunction<T> {
  description: string;
  property: keyof T;
}

export function useSortedList<T>(
  list: T[],
  sortProp: keyof T | null = null,
  isDesc: boolean = false
) {
  const [sortProperty, setSortProperty] = useState(sortProp);
  const [isDescending, setIsDescending] = useState(isDesc);

  const getSorted = useCallback(() => {
    if (sortProperty === null) {
      return isDescending ? [...list].sort().reverse() : [...list].sort();
    }

    return isDescending
      ? [...list].sort((a, b) => sortBy(b, a, sortProperty))
      : [...list].sort((a, b) => sortBy(a, b, sortProperty));
  }, [sortProperty, isDescending, list]);

  const sort = (property: keyof T) => {
    if (sortProperty === property) {
      setIsDescending(!isDescending);
      return;
    }

    setSortProperty(property);
    setIsDescending(false);
  };

  return {
    getSorted,
    sortProperty,
    setSortProperty,
    isDescending,
    setIsDescending,
    sort,
  };
}
