const dateIncrementDay = (date) => {
  date.setDate(date.getDate() + 1);
};
const dateDecrementDay = (date) => {
  date.setDate(date.getDate() - 1);
};
const dateIncrementMonth = (date) => {
  date.setMonth(date.getMonth() + 1, 1);
};
const dateDecrementMonth = (date) => {
  date.setMonth(date.getMonth() - 1, 1);
};
const dateIsNextMonth = (year1, month1, year2, month2) => {
  if (month1 === 12) {
    let yearDiff = year2 - year1;
    if (yearDiff === 1 && month2 === 1) {
      return true;
    }
    return false;
  }
  let monthDiff = month2 - month1;
  if (year1 === year2 && monthDiff === 1) {
    return true;
  }
  return false;
};
const dateIsPreviousMonth = (year1, month1, year2, month2) => {
  if (month1 === 1) {
    let yearDiff = year2 - year1;
    if (yearDiff === -1 && month2 === 12) {
      return true;
    }
    return false;
  }
  let monthDiff = month2 - month1;
  if (year1 === year2 && monthDiff === -1) {
    return true;
  }
  return false;
};
export {
  dateIncrementDay,
  dateDecrementDay,
  dateIncrementMonth,
  dateDecrementMonth,
  dateIsNextMonth,
  dateIsPreviousMonth,
};
