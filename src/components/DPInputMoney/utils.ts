export const formatter = (value: any) => {
  if (value === null || value === undefined) {
    return "";
  }

  let signal = "";
  let numberAux = Number(value);
  if (numberAux < 0) {
    numberAux *= -1;
    signal = "-";
  }

  const cents = numberAux % 100;
  const dollars = Math.floor(numberAux / 100);

  let ret = `${signal}${dollars.toLocaleString()},${cents
    .toString()
    .padStart(2, "0")}`;
  return ret;
};

export const parser = (value: string | any) => {
  let ret = value?.replace(/[^0-9]/g, "");
  return ret;
};
