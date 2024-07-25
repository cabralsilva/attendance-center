import { Tag } from "antd";
import "./styles.css";

interface IProps {
  label?: string;
  items: string[];
  onRemove?: (item: string) => void;
}

const FiltersTags = (props: IProps) => {
  const { label, items, onRemove } = props;

  const handleTagClose = (item: string) => {
    if (onRemove) {
      onRemove(item);
    }
  };

  return (
    <>
      {items.map((item) => {
        return (
          <Tag
            key={Math.random()}
            className="antd-filters-tags"
            closable={onRemove !== undefined}
            onClose={() => handleTagClose(item)}
          >
            <span>
              {label || ""}
              {item}
            </span>
          </Tag>
        );
      })}
    </>
  );
};

export default FiltersTags;
