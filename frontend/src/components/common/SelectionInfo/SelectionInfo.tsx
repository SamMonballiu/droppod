import styles from "./SelectionInfo.module.scss";
import { GoChevronDown, GoChevronUp } from "react-icons/go";
import useToggle from "@hooks/useToggle";
import { AiOutlineClear, AiOutlineClose } from "react-icons/ai";
import { BiSelectMultiple } from "react-icons/bi";

interface Props<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  onClearSelection: () => void;
  onSelectAll: () => void;
  onCancel: () => void;
  actions?: React.ReactNode;
}

export const SelectionInfo = <T,>({
  items,
  renderItem,
  onClearSelection,
  onSelectAll,
  onCancel,
  actions,
}: Props<T>) => {
  const { value: isExpanded, toggle: toggleExpanded } = useToggle(false);

  return (
    <div className={styles.container}>
      <div className={styles.shortInfo}>
        <p onClick={toggleExpanded}>{items?.length ?? 0}</p>
        {isExpanded ? (
          <GoChevronUp onClick={toggleExpanded} className={styles.expand} />
        ) : (
          <GoChevronDown onClick={toggleExpanded} className={styles.expand} />
        )}
        <AiOutlineClear
          className={styles.clearAll}
          onClick={onClearSelection}
        />
        <BiSelectMultiple className={styles.selectAll} onClick={onSelectAll} />
        <AiOutlineClose className={styles.cancel} onClick={onCancel} />
      </div>
      {isExpanded && (
        <div className={styles.longInfo}>{items.map(renderItem)}</div>
      )}
      {actions}
    </div>
  );
};