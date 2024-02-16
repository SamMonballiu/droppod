import { FileRatingValue } from "@models/fileinfo";
import { useState, useMemo } from "react";

export const ValueConstraints = ["AtLeast", "AtMost", "EqualTo"] as const;
export type ValueConstraint = (typeof ValueConstraints)[number];

export const TextConstraints = ["Contains", "DoesNotContain"] as const;
export type TextConstraint = (typeof TextConstraints)[number];

export type ValueFilter<T> = {
  isActive: boolean;
  type: ValueConstraint;
  value: T;
};

export type TextFilter = {
  isActive: boolean;
  type: TextConstraint;
  value: string;
};

type RatingFilter = ValueFilter<FileRatingValue>;

export interface FilterValues {
  rating: RatingFilter;
  name: TextFilter;
}

const isActive = (filter: FilterValues) =>
  filter.rating.isActive || filter.name.isActive;

export const noFilter: FilterValues = {
  rating: {
    isActive: false,
    type: "AtLeast",
    value: 0,
  },
  name: {
    isActive: false,
    type: "Contains",
    value: "",
  },
};

const filterOn = {
  rating: <T,>(
    filter: FilterValues,
    collection: T[],
    ratingGetter: (item: T) => FileRatingValue | undefined
  ) => {
    return collection.filter((x) => {
      const rating = ratingGetter(x);
      return filter.rating.type === "AtLeast"
        ? rating && rating >= filter.rating.value
        : filter.rating.type === "AtMost"
        ? rating
          ? rating <= filter.rating.value
          : true
        : filter.rating.value === 0
        ? !rating
        : rating === filter.rating.value;
    });
  },
  name: <T,>(
    filter: FilterValues,
    collection: T[],
    nameGetter: (item: T) => string
  ): T[] => {
    const { value, type } = filter.name;

    return collection.filter((x) => {
      const name = nameGetter(x);

      return (
        name.toLowerCase().includes(value.toLowerCase()) ===
        (type === "Contains" ? true : false)
      );
    });
  },
};

export interface PropertyGetters<T> {
  rating?: (item: T) => FileRatingValue | undefined;
  name?: (item: T) => string;
}

export interface FilterSetters {
  rating: (value: RatingFilter) => void;
  name: (value: TextFilter) => void;
}

export const filterCollection = <T,>(
  filter: FilterValues,
  collection: T[],
  getters: PropertyGetters<T>
) => {
  if (!isActive(filter)) {
    return collection;
  }

  let filtered = [...collection];
  if (filter.rating.isActive && getters.rating) {
    filtered = filterOn.rating(filter, filtered, getters.rating!);
  }

  if (filter.name.isActive && getters.name) {
    filtered = filterOn.name(filter, filtered, getters.name!);
  }

  return filtered;
};

type FilesFilterReturnType = {
  filters: FilterValues;
  filterSetters: FilterSetters;
  filterCollection: <T>(
    filter: FilterValues,
    collection: T[],
    getters: PropertyGetters<T>
  ) => T[];
  isActive: boolean;
  disable: () => void;
};

export const useFilesFilter = (): FilesFilterReturnType => {
  const [nameFilter, setNameFilter] = useState<TextFilter>(noFilter.name);
  const [ratingFilter, setRatingFilter] = useState<RatingFilter>(
    noFilter.rating
  );

  const filters = useMemo(() => {
    return {
      rating: ratingFilter,
      name: nameFilter,
    } as FilterValues;
  }, [ratingFilter, nameFilter]);

  return {
    filters,
    filterSetters: {
      rating: setRatingFilter,
      name: setNameFilter,
    } as FilterSetters,
    filterCollection,
    isActive: isActive(filters),
    disable: () => {
      setNameFilter(noFilter.name);
      setRatingFilter(noFilter.rating);
    },
  };
};
