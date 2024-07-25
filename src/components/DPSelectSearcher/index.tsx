import { DownOutlined } from "@ant-design/icons";
import { Button, Checkbox, Dropdown, Input } from "antd";
import { CheckboxChangeEvent } from "antd/es/checkbox";
import { useEffect, useState } from "react";
import FiltersTags from "../DPTable/Tags";
import { SIZE_PAGE_DEFAULT } from "../../const";


export interface IItem {
  value?: any;
  key: string;
  label: string;
}

interface IProps {
  _key: string;
  label: string;
  tagsPrefix?: string;
  initialValues?: IItem[];
  maxSelection?: number;
  unSelectAll?: boolean;
  searcher: (params: any) => Promise<IItem[]>;
  callback: (selections: IItem[], tag: Map<string, JSX.Element>) => any;
}

const DPSelectSearcher = (props: IProps) => {
  const {
    label,
    _key,
    tagsPrefix,
    maxSelection,
    initialValues,
    unSelectAll,
    callback,
    searcher,
  } = props;

  const [responseSearch, setResponseSearch] = useState<any[]>([]);
  const [selectedItems, setSelectedItems] = useState<any[]>(
    initialValues ?? []
  );
  const [searchText, setSearchText] = useState("");
  const [dropdownVisible, setDropdownVisible] = useState(false); // Track the visibility of the Dropdown
  const [isFocused, setIsFocused] = useState(false); // Track the visibility of the Dropdown
  const [sequenceRender, setSequenceRender] = useState<number>(0);

  const search = async (params: any) => {
    let itemsAux = await searcher(params);
    setResponseSearch(itemsAux);
  };

  const handleRemoveTag = async (removedLabel: string) => {
    removedLabel = removedLabel.replace(tagsPrefix ?? "", "").trim();
    let selectedItemsAux = [...selectedItems];
    selectedItemsAux = selectedItemsAux.filter((itemAux: any) => {
      let labelAux = itemAux?.label?.replace(tagsPrefix ?? "", "").trim();
      return labelAux !== removedLabel;
    });
    setSelectedItems([...selectedItemsAux]);
  };

  useEffect(() => {
    if (sequenceRender === 0) {
      setSequenceRender(sequenceRender + 1);
      return;
    }
    callback(
      selectedItems,
      new Map().set(
        _key,
        <FiltersTags
          onRemove={handleRemoveTag}
          items={selectedItems.map(
            (item: IItem) => `${tagsPrefix ?? ``} ${item.label}`
          )}
        />
      )
    );
  }, [selectedItems]);

  useEffect(() => {
    search({
      searchText,
      page: 1,
      limit: SIZE_PAGE_DEFAULT,
    });
  }, [searchText]);

  useEffect(() => {
    if (unSelectAll === true) {
      setSelectedItems([]);
    }
  }, [unSelectAll]);

  return (
    <Dropdown
      menu={{
        onMouseLeave: () => {
          setDropdownVisible(false);
          setIsFocused(false);
        },
        onClick: (_event: any) => {
          setIsFocused(true);
        },
        items: [
          {
            key: "searchText",
            label: (
              <Input
                placeholder="Pesquisar..."
                onChange={(e: any) => {
                  setSearchText(e.target.value);
                }}
              />
            ),
          },
          ...responseSearch.map((item: any) => {
            return {
              key: item.key,
              label: (
                <Checkbox
                  name={item.key}
                  disabled={
                    selectedItems.length === (maxSelection ?? 10) &&
                    selectedItems.every(
                      (itemAux: any) => itemAux.key !== item.key
                    )
                  }
                  onChange={(e: CheckboxChangeEvent) => {
                    if (e.target.checked) {
                      setSelectedItems([...selectedItems, item]);
                      return;
                    }
                    let selectedItemsAux = [...selectedItems];
                    selectedItemsAux = selectedItemsAux.filter(
                      (itemAux: any) => itemAux.key !== item.key
                    );
                    setSelectedItems([...selectedItemsAux]);
                  }}
                  checked={selectedItems.some(
                    (itemAux: any) => itemAux.key === item.key
                  )}
                >
                  {item.labelRender ?? item.label}
                </Checkbox>
              ),
            };
          }),
        ],
      }}
      trigger={["click"]}
      open={dropdownVisible || isFocused}
      onOpenChange={(visible) => setDropdownVisible(visible)}
    >
      <Button
        style={{
          width: "100%",
          color: "#000",
          border: "1px solid #000",
          display: "flex",
          justifyContent: "space-between",
          paddingLeft: "12px",
          paddingRight: "12px",
        }}
      >
        {label}
        <div>
          <DownOutlined rev={undefined} />
        </div>
      </Button>
    </Dropdown>
  );
};

export default DPSelectSearcher;
