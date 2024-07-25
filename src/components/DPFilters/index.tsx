import { Row } from "antd";
import "./styles.css";

interface IProps {
  children: React.ReactNode;
}

const DPFilters = (props: IProps) => {
  const { children } = props;

  return (
    <>
      <Row justify="start" className="dp-filters-row">
        {children}
      </Row>
    </>
  );
};

export default DPFilters;
