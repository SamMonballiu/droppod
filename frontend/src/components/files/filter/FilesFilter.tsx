import { Rating } from "@components";
import { DebouncedTextBox } from "@components/common/DebouncedTextBox/DebouncedTextBox";
import { FileRatingValue } from "@models/fileinfo";
import { FC, useState, useMemo, useEffect } from "react";
import styles from "./FilesFilter.module.scss";

type ValueConstraint = "AtLeast" | "AtMost" | "Exactly";
type TextConstraint = "Contains" | "DoesNotContain";

type ValueFilter<T> = {
  isActive: boolean;
  type: ValueConstraint;
  value: T;
};

type TextFilter = {
  isActive: boolean;
  type: TextConstraint;
  value: string;
};

type RatingFilter = ValueFilter<FileRatingValue>;

export interface FilterValues {
  rating: RatingFilter;
  name: TextFilter;
}

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

export const filterCollection = <T,>(
  filter: FilterValues,
  collection: T[],
  getters: PropertyGetters<T>
) => {
  let filtered = [...collection];
  if (filter.rating.isActive && getters.rating) {
    filtered = filterOn.rating(filter, collection, getters.rating!);
  }

  if (filter.name.isActive && getters.name) {
    filtered = filterOn.name(filter, collection, getters.name!);
  }

  return filtered;
};

interface Props {
  onChange: (filter: FilterValues) => void;
}

export const FilesFilter: FC<Props> = ({ onChange }) => {
  const [nameFilter, setNameFilter] = useState<TextFilter>({
    isActive: true,
    type: "Contains",
    value: "json",
  });
  const [ratingFilter, setRatingFilter] = useState<RatingFilter>({
    isActive: false,
    type: "AtLeast",
    value: 0,
  });

  const filters = useMemo(() => {
    return {
      rating: ratingFilter,
      name: nameFilter,
    } as FilterValues;
  }, [ratingFilter, nameFilter]);

  useEffect(() => {
    onChange(filters);
  }, [filters]);

  return (
    <div className={styles.filters}>
      <ValueFilter
        label="Rating"
        filter={ratingFilter}
        updateFilter={setRatingFilter}
      >
        <Rating
          value={ratingFilter.value}
          onRate={async (value) => setRatingFilter({ ...ratingFilter, value })}
        />
      </ValueFilter>

      <TextFilter
        label="Name"
        filter={nameFilter}
        updateFilter={setNameFilter}
      />
    </div>
  );
};

interface FilterProps<T> extends React.PropsWithChildren {
  label: string;
  filter: T;
  updateFilter: (filter: T) => void;
}

type TextFilterProps = Omit<FilterProps<TextFilter>, "children">;

const TextFilter: FC<TextFilterProps> = ({ label, filter, updateFilter }) => {
  const toggleActive = () =>
    updateFilter({ ...filter, isActive: !filter.isActive });

  return (
    <section className={styles.option}>
      <input
        type="checkbox"
        checked={filter.isActive}
        onChange={toggleActive}
      />
      <span className={styles.clickable} onClick={toggleActive}>
        {label}
      </span>
      <select
        value={filter.type}
        onChange={(e) =>
          updateFilter({
            ...filter,
            type: e.target.value as TextConstraint,
          })
        }
      >
        {(["Contains", "DoesNotContain"] as TextConstraint[]).map((x) => (
          <option key={x} value={x}>
            {humanise(x)}
          </option>
        ))}
      </select>
      <DebouncedTextBox
        value={filter.value}
        onChange={(value) => {
          updateFilter({
            ...filter,
            isActive: value !== "",
            value,
          });
        }}
      />
    </section>
  );
};

type ValueFilterProps<T> = FilterProps<ValueFilter<T>>;
const ValueFilter = <T,>({
  label,
  filter,
  updateFilter,
  children,
}: ValueFilterProps<T>) => {
  const toggleActive = () =>
    updateFilter({ ...filter, isActive: !filter.isActive });

  return (
    <section className={styles.option}>
      <input
        type="checkbox"
        checked={filter.isActive}
        onChange={toggleActive}
      />
      <span onClick={toggleActive} className={styles.clickable}>
        {label} is
      </span>
      <select
        value={filter.type}
        onChange={(e) =>
          updateFilter({
            ...filter,
            type: e.target.value as ValueConstraint,
          })
        }
      >
        {(["AtLeast", "AtMost", "Exactly"] as ValueConstraint[]).map((x) => (
          <option key={x} value={x}>
            {humanise(x)}
          </option>
        ))}
      </select>
      {children}
    </section>
  );
};

const humanise = (input: string): string => {
  // Use a regular expression to split the string on capital letters
  const splitArray = input.split(/(?=[A-Z])/);
  return splitArray.join(" ").toLowerCase();
};
