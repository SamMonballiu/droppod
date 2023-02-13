import { useEffect, useState } from "react";

export function useListSelection<T>(list: T[], initialSelection?: number) {
  const [selectedIndex, setSelectedIndex] = useState<number>(
    initialSelection ?? 0
  );

  const [selectedItem, setSelectedItem] = useState<T>(
    list[initialSelection ?? 0]
  );

  useEffect(() => {
    setSelectedItem(list[selectedIndex]);
  }, [selectedIndex]);

  const select = (direction: "previous" | "next") => {
    setSelectedIndex((currentIndex) => {
      let newIndex: number;
      switch (direction) {
        case "previous":
          newIndex = currentIndex === 0 ? list.length - 1 : currentIndex - 1;
          break;
        case "next":
          newIndex = currentIndex === list.length - 1 ? 0 : currentIndex + 1;
          break;
      }
      return newIndex;
    });
  };

  const selectItem = (item: T) => {
    if (list.includes(item)) {
      setSelectedIndex(list.indexOf(item));
    }
  };

  const isSelected = (item: T) =>
    list.includes(item) && selectedIndex === list.indexOf(item);

  return {
    selectedIndex,
    selectedItem,
    select,
    selectItem,
    isSelected,
  };
}
