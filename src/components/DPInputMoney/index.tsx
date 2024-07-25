import { InputNumber } from "antd";
import Form, { FormInstance, Rule } from "antd/es/form";
import { NamePath } from "antd/es/form/interface";
import { useEffect, useState } from "react";

import { formatter, parser } from "./utils";
import "./styles.scss";

interface CustomInputNumberProps {
  name: NamePath<any>;
  label: React.ReactNode;
  value?: number;
  disabled?: boolean;
  rules?: Rule[];
  onChange: (value: number) => void;
  form: FormInstance<any>;
}
const DPInputMoney: React.FC<any> = (props: CustomInputNumberProps) => {
  const { name, label, disabled, rules, onChange, value, form, ...otherProps } =
    props;

  const [firstRender, setFirstRender] = useState<boolean>(true);
  const [localValue, setLocalValue] = useState<number>(
    ((otherProps as any).value as number) ?? 0
  );
  const [timer, setTimer] = useState<any>();

  const onLocalChange = (value: number) => {
    setLocalValue(value);
  };

  useEffect(() => {
    if (form) {
      form.setFieldsValue({ [name as string]: value ?? 0 });
      onLocalChange(value ?? 0);
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
    }, 100);
    setTimer(newTimer);
  }, [localValue]);

  return (
    <Form.Item label={label} name={name} rules={[...(rules ?? [])]}>
      <InputNumber
        {...otherProps}
        controls={false}
        disabled={disabled}
        onChange={onLocalChange}
        prefix="R$"
        formatter={formatter}
        parser={parser}
      />
    </Form.Item>
  );
};

export default DPInputMoney;
