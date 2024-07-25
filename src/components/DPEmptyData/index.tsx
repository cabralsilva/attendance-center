import { Empty } from "antd";

import EmptyImage from "../../assets/svg/empty-data.svg?react";
import React from "react";

const DPEmptyData = () => {
  return (
    <Empty
      image={React.createElement(EmptyImage)}
      imageStyle={{ height: 60 }}
      description={<span style={{ color: "gray" }}>Não há dados</span>}
    />
  );
};

export default DPEmptyData;
