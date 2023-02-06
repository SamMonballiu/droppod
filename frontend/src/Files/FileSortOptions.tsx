import { FC, useMemo } from "react";
import { FileInfo } from "../../../models/fileinfo";
import { RadioGroup } from "@headlessui/react";
import cx from "classnames";
import styles from "./FileSortOptions.module.scss";
import { GoTriangleDown, GoTriangleUp } from "react-icons/go";

export interface SortOption<T> {
  property: keyof T;
  name: string;
}

interface Props {
  options: SortOption<FileInfo>[];
  value: keyof FileInfo;
  onChange: (newValue: keyof FileInfo) => void;
  isDescending: boolean;
}

const FileSortOptions: FC<Props> = ({
  options,
  value,
  onChange,
  isDescending,
}) => {
  const groupOptions = useMemo(
    () =>
      options.map((opt) => (
        <RadioGroup.Option
          key={opt.property}
          value={opt}
          className={cx(
            { [styles.active]: opt.property === value },
            styles.option
          )}
        >
          <span>{opt.name}</span>
          {value === opt.property && (
            <div className={styles.icon}>
              {isDescending ? <GoTriangleDown /> : <GoTriangleUp />}
            </div>
          )}
        </RadioGroup.Option>
      )),
    [options]
  );

  return (
    <RadioGroup value={value} onChange={onChange} className={styles.options}>
      {groupOptions}
    </RadioGroup>
  );
};

export default FileSortOptions;
