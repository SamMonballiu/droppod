import { Rating } from "@components";
import { DebouncedTextBox } from "@components/common/DebouncedTextBox/DebouncedTextBox";
import {
  FilterSetters,
  FilterValues,
  TextConstraint,
  ValueConstraint,
  TextFilter,
  ValueFilter,
} from "@hooks/useFilesFilter";
import { FileRatingValue } from "@models/fileinfo";
import { FC, useState, useMemo, useEffect } from "react";
import styles from "./FilesFilter.module.scss";

interface Props {
  filter: FilterValues;
  onChange: FilterSetters;
  //onChange: (filter: FilterValues) => void;
}

export const FilesFilter: FC<Props> = ({ filter, onChange }) => {
  // const [nameFilter, setNameFilter] = useState<TextFilter>(emptyFilter.name);
  // const [ratingFilter, setRatingFilter] = useState<RatingFilter>(
  //   emptyFilter.rating
  // );

  // const filters = useMemo(() => {
  //   return {
  //     rating: ratingFilter,
  //     name: nameFilter,
  //   } as FilterValues;
  // }, [ratingFilter, nameFilter]);

  // useEffect(() => {
  //   onChange(filters);
  // }, [filters]);

  return (
    <div className={styles.filters}>
      <ValueFilter
        label="Rating"
        filter={filter.rating}
        updateFilter={onChange.rating}
      >
        <Rating
          value={filter.rating.value}
          onRate={async (value) => onChange.rating({ ...filter.rating, value })}
        />
      </ValueFilter>

      <TextFilter
        label="Name"
        filter={filter.name}
        updateFilter={onChange.name}
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
