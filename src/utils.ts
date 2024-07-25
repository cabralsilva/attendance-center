import moment from "moment"
import { DayOfWeekTranslate } from "./models/EnumDayOfWeek"



export const isNotEmpty = (obj: any) => {
  return !isEmpty(obj)
}

export const isEmpty = (obj: any) => {
  if (typeof obj === 'undefined') {
    return true
  }

  if (typeof obj === 'number') {
    if (isNaN(obj)) {
      return true
    }
    return false
  }

  if (obj === 'undefined') {
    return true
  }

  if (!obj) {
    return true
  }

  if (Array.isArray(obj)) {
    if (obj.length == 0) {
      return true
    }
  }

  if (obj === "") {
    return true
  }

  return false
}

export const phoneMask = (value: string | number) => {
  if (value === undefined) {
    return "";
  }
  const numericValue = value.toString().replace(/\D/g, "");

  let formattedValue = "";

  if (numericValue.length <= 10) {
    // SEM NONO DIGITO
    formattedValue = numericValue.replace(
      /(\d{0,2})(\d{0,4})(\d{0,4})/,
      (_match, p1, p2, p3) => {
        let result = "";
        if (p1) {
          if (p1.length === 2) {
            result += `(${p1}) `;
          }
        }
        if (p2) {
          result += p2;
          if (p2.length === 4) {
            result += "-";
          }
        }

        if (p3) {
          result += p3;
        }
        return result;
      }
    );
  } else if (numericValue.length === 11) {
    // COM NONO DIGITO
    formattedValue = numericValue.replace(
      /(\d{0,2})(\d{0,1})(\d{0,4})(\d{0,4})/,
      (_match, p1, p2, p3, p4) => {
        let result = "";
        if (p1) {
          if (p1.length === 2) {
            result += `(${p1}) `;
          }
        }
        if (p2) {
          if (p2.length === 1) {
            result += ` ${p2} `;
          }
        }
        if (p3) {
          result += p3;
          if (p3.length === 4) {
            result += "-";
          }
        }

        if (p4) {
          result += p4;
        }
        return result;
      }
    );
  } else {
    formattedValue = value.toString();
  }

  return formattedValue;
};

export const trunc = (value: number, decimalPlates = 0): number => {
  if (value === undefined || isNaN(value)) {
    return value;
  }

  const factor = 10 ** decimalPlates;
  let rounded = Math.trunc(value * factor) / factor;
  return rounded;
}

export const round = (value: number, decimalPlates = 0): number => {
  if (value === undefined || isNaN(value)) {
    return value;
  }
  value = trunc(value, decimalPlates + 1);
  const factor = 10 ** decimalPlates;
  let rounded = Math.round(value * factor) / factor;
  return rounded;
}

export const handleCents = (value: number, decimalPlates = 2) => {
  if (value === undefined) {
    value = 0;
  }
  const integerPart = value.toString().split(".")[0];
  const decimalPart = value.toString().split(".")[1];
  let valueAux: number = Number(integerPart) / 100;
  if (Number(decimalPart) > 0) {
    let valueConcatenated = `${valueAux.toString()}${decimalPart}`;
    if (valueAux % 1 === 0) {
      valueConcatenated = `${valueAux.toString()}.${decimalPart}`;
    }
    valueAux = Number(valueConcatenated);
  }
  const valor = valueAux.toFixed(decimalPlates);
  return valor;
}

export const toMoneyBR = (value: number, decimalPlates = 2) => {
  value = round(value, 4);
  const v = handleCents(value, decimalPlates);
  return Number(v).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: decimalPlates,
  });
}

export const getDayPastAsText = (date: moment.Moment) => {
  if (moment().date() - date.date() === 0) {
    return `Hoje`
  }
  if (moment().date() - date.date() === 1) {
    return `Ontem, ${date.format("DD/MM/YYYY")}`
  }
  if (moment().date() - date.date() >= 2) {
    return `${DayOfWeekTranslate[date.day()]}, ${date.format("DD/MM/YYYY")}`
  }
}