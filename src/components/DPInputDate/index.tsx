import { DatePicker, FormInstance } from "antd";
import Form, { Rule } from "antd/es/form";
import { NamePath } from "antd/es/form/interface";
import dayjs from "dayjs";
import IMask from "imask";
import moment from "moment";
import React, { useEffect, useState } from "react";
import "./styles.scss"

const DATE_FORMAT = "DD/MM/YYYY";
const MASKED = IMask.createMask({
  blocks: {
    DD: { from: 1, mask: IMask.MaskedRange, to: 31 },
    MM: { from: 1, mask: IMask.MaskedRange, to: 12 },
    YYYY: { from: 1900, mask: IMask.MaskedRange, to: Number.MAX_VALUE },
  },
  format: (date: Date) => moment(date).format(DATE_FORMAT),
  mask: Date,
  parse: (date: string) => moment(date, DATE_FORMAT),
  pattern: DATE_FORMAT,
} as any);

interface CustomDateProps {
  name: NamePath<any>;
  label: React.ReactNode;
  value?: Date;
  initialValue?: Date;
  disabled?: boolean;
  rules?: Rule[];
  onChange: (value?: Date) => void;
  form: FormInstance<any>;
}
const DPInputDate2: React.FC<any> = (props: CustomDateProps) => {
  const {
    name,
    label,
    disabled,
    initialValue,
    rules,
    onChange,
    value,
    form,
    ...otherProps
  } = props;

  const [firstRender, setFirstRender] = useState<boolean>(true);
  const [localValue, setLocalValue] = useState<Date>();
  const [timer, setTimer] = useState<any>();

  const onLocalChange = (value?: Date) => {
    setLocalValue(value);
  };

  useEffect(() => {
    if (form) {
      form.setFieldsValue({ [name as string]: value });
      onLocalChange(value);
    }
  }, [name, value]);

  useEffect(() => {
    if (firstRender) {
      setFirstRender(false);
      if (onChange) {
        onChange(localValue);
      }
      return;
    }
    if (timer) {
      clearTimeout(timer);
    }
    let newTimer = setTimeout(() => {
      if (onChange) {
        onChange(localValue);
      }
    }, 500);
    setTimer(newTimer);
  }, [localValue]);

  useEffect(() => {
    if (form) {
      form.setFieldsValue({ [name as string]: initialValue ?? dayjs() });
    }
  }, []);

  return (
    <Form.Item
      label={label}
      name={name}
      rules={[...(rules ?? [])]}
      initialValue={dayjs()}
    >
      <DatePicker
        {...otherProps}
        style={{ width: "100%" }}
        format={DATE_FORMAT}
        onKeyDown={(event: React.KeyboardEvent<HTMLElement>) => {
          const input = event.target as HTMLInputElement;
          input.value = MASKED.resolve(input.value);
        }}
        picker="date"
        placeholder="Selecione ou digite"
        onChange={(value: any) => {
          onLocalChange(value?.$d);
        }}
      />
    </Form.Item>
  );
};

export default DPInputDate2;
