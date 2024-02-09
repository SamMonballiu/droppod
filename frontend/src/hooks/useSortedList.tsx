import { useState, useCallback } from "react";

export const sortBy = <T,>(a: T, b: T, property: keyof T) => {
  const aValue = a[property];
  const bValue = b[property];

  if (typeof aValue === "string" && typeof bValue === "string") {
    const lowerA = aValue.toLowerCase();
    const lowerB = bValue.toLowerCase();
    return lowerA.localeCompare(lowerB);
  }

  return aValue < bValue ? -1 : 0;
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
