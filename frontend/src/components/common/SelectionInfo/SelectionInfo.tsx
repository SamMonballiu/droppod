import styles from "./SelectionInfo.module.scss";
import { GoChevronDown, GoChevronUp } from "react-icons/go";
import useToggle from "@hooks/useToggle";
import { AiOutlineClear, AiOutlineClose } from "react-icons/ai";
import { BiSelectMultiple } from "react-icons/bi";
import { MdMusicNote } from "react-icons/md";

interface Props<T> {
  items: T[];
  summary?: React.ReactNode;
  renderItem: (item: T) => React.ReactNode;
  onClearSelection: () => void;
  onSelectAll: () => void;
  onCancel: () => void;
  actions?: React.ReactNode;
}

export const SelectionInfo = <T,>({
  items,
  summary,
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
        <div className={styles.summary} onClick={toggleExpanded}>
          <p>{items.length}</p>
          {summary && (
            <div style={{ display: "flex", alignItems: "center" }}>
              <span>(</span>
              {summary}
              <span>)</span>
            </div>
          )}
        </div>
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
