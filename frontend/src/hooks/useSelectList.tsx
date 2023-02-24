import { useMemo, useState } from "react";
import { SubscribableEvent } from "../../../models/event";

type ReturnType = [
  selectedIds: string[],
  isSelected: (id: string) => boolean,
  toggleSelected: (id: string) => void,
  setSelected: (id: string, value: boolean) => void,
  setAllSelected: (value: boolean) => void,
  events: {
    onSelectedChanged: SubscribableEvent<{
      element: string;
      selected: boolean;
    }>;
    onSetAllSelected: SubscribableEvent<boolean>;
  }
];

interface Options {
  startSelected?: boolean;
}

const useSelectList = (ids: string[], options?: Options): ReturnType => {
  const [selectedIds, setSelectedIds] = useState<string[]>(
    options?.startSelected ? ids : []
  );

  const isSelected = (id: string) => selectedIds.includes(id);

  const onSelectedChanged = useMemo(
    () => new SubscribableEvent<{ element: string; selected: boolean }>(),
    []
  );
  const onSetAllSelected = useMemo(() => new SubscribableEvent<boolean>(), []);

  const toggleSelected = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((x) => x !== id));
      onSelectedChanged.raise({ element: id, selected: false });
    } else {
      setSelectedIds([...selectedIds, id]);
      onSelectedChanged.raise({ element: id, selected: true });
    }
  };

  const setSelected = (id: string, value: boolean) => {
    if (value && !selectedIds.includes(id)) {
      setSelectedIds([...selectedIds, id]);
    }

    if (!value) {
      setSelectedIds(selectedIds.filter((x) => x !== id));
    }
  };

  const setAllSelected = (value: boolean) => {
    setSelectedIds(value ? ids : []);
    onSetAllSelected.raise(value);
  };

  return [
    selectedIds,
    isSelected,
    toggleSelected,
    setSelected,
    setAllSelected,
    {
      onSelectedChanged,
      onSetAllSelected,
    },
  ];
};

export default useSelectList;
