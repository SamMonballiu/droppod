import { GoChevronRight } from "react-icons/go";
import { AiOutlineHome } from "react-icons/ai";
import { FC } from "react";
import styles from "./Breadcrumbs.module.scss";
import cx from "classnames";

interface Props {
  path: string;
  onClick: (destination: string) => void;
}

const Breadcrumbs: FC<Props> = ({ path, onClick }) => {
  const pathElements = path.split("/");

  const mapped = pathElements.map((el, idx) => {
    const targetUrl = pathElements.slice(0, idx + 1).join("/");
    const isLastElement = idx === pathElements.length - 1;
    return (
      <div className={styles.crumb} key={targetUrl}>
        {targetUrl !== "" ? (
          <span
            className={cx({ [styles.clickable]: !isLastElement })}
            onClick={isLastElement ? undefined : () => onClick(targetUrl)}
          >
            {el}
          </span>
        ) : (
          <AiOutlineHome
            className={cx({ [styles.clickable]: pathElements.length > 1 })}
            onClick={() => onClick(targetUrl)}
          />
        )}

        {!isLastElement && <GoChevronRight className={styles.chevron} />}
      </div>
    );
  });
  return <section className={styles.container}>{mapped}</section>;
};

export default Breadcrumbs;
