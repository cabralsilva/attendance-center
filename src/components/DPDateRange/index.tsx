import { DatePicker } from "antd";
import dayjs, { Dayjs } from "dayjs";
import localeData from "dayjs/plugin/localeData";
import weekday from "dayjs/plugin/weekday";
import moment from "moment";
import { useEffect, useRef, useState } from "react";
import { isNotEmpty } from "../../utils";
import FiltersTags from "../DPTable/Tags";
import "./styles.scss";

interface IDateRangeParams {
  0: "M2";
  $D: number;
  $H: number;
  $L: string;
  $M: number;
  $W: number;
  $d: Date;
  $m: number;
  $ms: number;
  $s: number;
  $u?: undefined;
  $x: Record<string, unknown>;
  $y: number;
}

const rangePresets: {
  label: string;
  value: [Dayjs, Dayjs];
}[] = [
    { label: "Últimos 7 Dias", value: [dayjs().add(-7, "d"), dayjs()] },
    { label: "Últimos 14 Dias", value: [dayjs().add(-14, "d"), dayjs()] },
    { label: "Últimos 30 Dias", value: [dayjs().add(-30, "d"), dayjs()] },
    { label: "Últimos 90 Dias", value: [dayjs().add(-90, "d"), dayjs()] },
    {
      label: "Mês atual",
      value: [dayjs().set("date", 1), dayjs().endOf("month")],
    },
    {
      label: "Mês anterior",
      value: [
        dayjs().subtract(1, "month").startOf("month"),
        dayjs().subtract(1, "month").endOf("month"),
      ],
    },
    {
      label: "Próximo mês",
      value: [
        dayjs().add(1, "month").startOf("month"),
        dayjs().add(1, "month").endOf("month"),
      ],
    },
  ];
dayjs.extend(weekday);
dayjs.extend(localeData);

interface IProps {
  _key: string;
  callback: (
    range: [Date | undefined, Date | undefined],
    tag: Map<string, JSX.Element>
  ) => any;
  label: string;
  tagsPrefix?: string;
  initialValue?: [Date, Date];
}

const DPDateRange = (props: IProps) => {
  const {
    tagsPrefix,
    label,
    _key,
    initialValue,
    callback
  } = props;

  const [start, setStart] = useState<any>();
  const [end, setEnd] = useState<any>();
  const [dateRange, setDateRange] = useState<Date[]>();

  const onChangeDate = (dates: IDateRangeParams[] | undefined) => {
    if (dates === undefined || dates === null) {
      setStart(null);
      setEnd(null);
      setDateRange(undefined);
      return;
    }

    let range = dates?.map((date: IDateRangeParams) => {
      return date?.$d;
    });
    range = range.filter((date: Date) => date !== undefined);

    setDateRange(range);
    setStart(range[0]);
    setEnd(range[1]);
  };

  useEffect(() => {
    let tagText = `${tagsPrefix ?? ""} `;
    let tag: JSX.Element = <></>;
    if (dateRange) {
      if (dateRange[0]) {
        tagText += `a partir de ${moment(dateRange[0]).format("DD/MM/YYYY")} `;
      }
      if (dateRange[1]) {
        tagText += `até ${moment(dateRange[1]).format("DD/MM/YYYY")}`;
      }
      tag = (
        <FiltersTags
          items={[tagText]}
          onRemove={() => onChangeDate(undefined)}
        />
      );
    }

    return callback(
      dateRange ? [dateRange[0], dateRange[1]] : [undefined, undefined],
      new Map().set(_key, tag)
    );
  }, [dateRange]);

  useEffect(() => {
    if (isNotEmpty(initialValue)) {
      setDateRange(initialValue);
    }
  }, []);

  const rangePickerRef = useRef(null);

  useEffect(() => {
    if (rangePickerRef.current) {
      const element = (rangePickerRef.current as any).querySelector('.ant-picker-range');
      if (element) {
        element.setAttribute('data-label', label);
      }
    }
  }, []);

  return (
    <div
      ref={rangePickerRef}
      className="dp-date-range"
      data-label={label}
    >

      <DatePicker.RangePicker
        presets={rangePresets}
        allowClear
        onChange={(date: any) => onChangeDate(date)}
        value={
          start && end
            ? [dayjs(start), dayjs(end)]
            : start
              ? [dayjs(start), null]
              : end
                ? [null, dayjs(end)]
                : [null, null]
        }
        allowEmpty={[true, false]}
      />
    </div>
  );
};

export default DPDateRange;
