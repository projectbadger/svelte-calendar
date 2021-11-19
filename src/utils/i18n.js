let i18n = {
  monthsToDisplay: [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ],
  weekdays: [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ],
};
const getI18N = () => {
  return i18n;
};
const setI18N = (translations) => {
  i18n = translations;
};
const getWeekdays = () => {
  return i18n.weekdays;
};
const setWeekdays = (weekdays) => {
  i18n.weekdays = weekdays;
};
const getMonthNames = () => {
  return i18n.monthsToDisplay;
};
const setMonthNames = (monthdays) => {
  i18n.monthsToDisplay = monthdays;
};
export {
  getI18N,
  setI18N,
  getWeekdays,
  setWeekdays,
  getMonthNames,
  setMonthNames,
};
