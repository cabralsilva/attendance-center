import { SearchOutlined } from "@ant-design/icons";
import { Button, Input, InputRef, Space } from "antd";
import {
  FilterConfirmProps,
  FilterDropdownProps,
} from "antd/es/table/interface";
import { useRef, useState } from "react";

import { isNotEmpty } from "../../../utils";
import FiltersTags from "../Tags";

export interface IDPTableFilterCollumn {
  id: string;
  label: string;
  setSelectedKeys: (selectedKeys: React.Key[]) => void;
  confirm: (param?: FilterConfirmProps) => void;
  clearFilters?: () => void;
  close: () => void;
}
interface ICustomProps extends Partial<FilterDropdownProps> {
  id: string;
  label: string;
  onClose: () => void;
  onReset: () => void;
  onConfirm: (values: string, tag: Map<string, JSX.Element>) => void;
}

const DPTableFilterCollum = (props: ICustomProps) => {
  const { id, label, onConfirm, onReset, onClose } = props;
  const searchInput = useRef<InputRef>(null);

  const [searchText, setSearchText] = useState<string>("");

  const onConfirmSearch = (text: string) => {
    const tags = new Map().set(
      id,
      <FiltersTags
        // onRemove={(label: string) => {
        //   onConfirm("", new Map().set(id, undefined));
        //   setSearchText("");
        // }}
        items={isNotEmpty(text) ? [`${label} ${text}`] : []}
      />
    );
    onConfirm(searchText, tags);
  };

  return (
    <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
      <Input
        ref={searchInput}
        placeholder={`${label}`}
        value={searchText}
        onChange={(e) => {
          setSearchText(e.target.value);
        }}
        onPressEnter={() => {
          onConfirmSearch(searchText);
        }}
        style={{ marginBottom: 8, display: "block" }}
      />
      <Space>
        <Button
          type="primary"
          onClick={() => {
            onConfirmSearch(searchText);
          }}
          icon={<SearchOutlined />}
          size="small"
          className="dp-button"
        >
          Pesquisar
        </Button>
        <Button
          className="dp-button"
          onClick={() => {
            onReset();
            setSearchText("");
          }}
          size="small"
        >
          Limpar
        </Button>
        <Button
          type="link"
          size="small"
          className="dp-button"
          onClick={() => {
            onClose();
          }}
        >
          fechar
        </Button>
      </Space>
    </div>
  );
};

export default DPTableFilterCollum;
