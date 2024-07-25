import { Input } from "antd";
import { useEffect, useState } from "react";
import "./styles.scss"

import DPTags from "../DPTags";

const defaultDelay = 500
interface IProps {
  _key: string;
  label: string;
  value?: string;
  callback: (searchText: string, tag: Map<string, JSX.Element>) => any;
}

const DPFilterSearchText = (props: IProps) => {
  const { _key, value, label, callback } = props;

  const [searchText, setSearchText] = useState<string | undefined>(value);
  const [timer, setTimer] = useState<any>();
  const [sequenceRender, setSequenceRender] = useState<number>(0);

  const handleRemoveTag = async (_removedLabel: string) => {
    setSearchText("");
  };

  const onSearch = (value: string) => {
    if (value !== searchText && sequenceRender > 0) {
      setSearchText(value);
    }
  };

  const onChange = (event: any) => {
    if (event.target.value !== searchText && sequenceRender > 0) {
      setSearchText(event.target.value);
    }
  };

  useEffect(() => {
    if (sequenceRender === 0) {
      setSequenceRender(sequenceRender + 1);
      return;
    }

    if (timer) {
      clearTimeout(timer);
    }
    let newTimer = setTimeout(() => {
      let tags = [];
      if (searchText !== undefined && searchText !== "") {
        tags.push(searchText);
      }
      callback(
        searchText!,
        new Map().set(
          _key,
          <DPTags
            label="Busca por: "
            onRemove={handleRemoveTag}
            items={tags}
          />
        )
      );
    }, defaultDelay);
    setTimer(newTimer);
  }, [searchText]);

  return (
    <Input.Search
      className="dp-search-text"
      placeholder={label}
      onSearch={onSearch}
      onChange={onChange}
      value={searchText}
      style={{ width: "100%" }}
    />
  );
};

export default DPFilterSearchText;
