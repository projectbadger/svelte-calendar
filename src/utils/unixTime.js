const getDaysInMonth = (unixMillis) => {
  let date = new Date();
  date.setTime(unixMillis);
  let year = date.getFullYear();
  let month = date.getMonth() + 1;
  date.setFullYear(year, month, 0);
  return date.getDate();
};
const getFirstDayInMonth = (unixMillis) => {
  let date = new Date();
  date.setTime(unixMillis);
  date.setDate(1);
  return date.getTime();
};
const getWeekDay = (unixMillis) => {
  let date = new Date();
  date.setTime(unixMillis);
  return date.getDay();
};
const isWeekEnd = (unixMillis) => {
  let date = new Date();
  date.setTime(unixMillis);
  return date.getDay() === 0 || date.getDay() === 6;
};
const getNextDay = (unixMillis) => {
  // let date = new Date();
  // date.setTime(unixMillis);
  // date.setFullYear(date.getFullYear(), date.getMonth(), date.getDate() + 1);
  // return date.getTime();
  return unixMillis + millisInDay;
};
const getPreviousDay = (unixMillis) => {
  // let date = new Date();
  // date.setTime(unixMillis);
  // date.setMonth(date.getMonth(), date.getDate() - 1);
  // return date.getTime();
  return unixMillis - millisInDay;
};
const getNextMonth = (unixMillis) => {
  let date = new Date();
  date.setTime(unixMillis);
  date.setFullYear(date.getFullYear(), date.getMonth() + 1, 1);
  return date.getTime();
};
const getPreviousMonth = (unixMillis) => {
  let date = new Date();
  date.setTime(unixMillis);
  date.setFullYear(date.getFullYear(), date.getMonth() - 1, 1);
  return date.getTime();
};
const weekDayDifference = (day1, day2) => {
  day1 = day1 - day2;
  return day1 <= 6 ? day1 : day1 + 7;
};
const addCurrentTimeHours = (unixMillis, hours=0, minutes=0, seconds=0) => {
  let time = new Date(unixMillis);
  let now = new Date();
  if(hours > 0 && minutes > 0 && seconds > 0) {
    time.setHours(hours);
  time.setMinutes(minutes);
  time.setSeconds(seconds);
  return time.getTime();
  }
  time.setHours(now.getHours());
  time.setMinutes(now.getMinutes());
  time.setSeconds(now.getSeconds());
  return time.getTime();
}
const getTimeFromUnixMillis = (unixMillis) => {
  let unix = Math.round(unixMillis / 1000);
  // let s = 1313905026;
  let shifted = Math.floor(unix / 86400) + 719468;
  let era = Math.floor((shifted >= 0 ? shifted : shifted - 146096) / 146097);
  let dayOfEra = shifted - era * 146097;
  let yearOfEra =
  Math.floor((dayOfEra - Math.floor(dayOfEra / 1460) + Math.floor(dayOfEra / 36524) - Math.floor(dayOfEra / 146096)) / 365);
  let year = yearOfEra + era * 400;
  let dayOfYear = dayOfEra - (365 * yearOfEra + Math.floor(yearOfEra / 4) - Math.floor(yearOfEra / 100));
  let mp = Math.floor((5 * dayOfYear + 2) / 153);
  let day = dayOfYear - Math.floor((153 * mp + 2) / 5) + 1;
  let month = mp + (mp < 10 ? 3 : -9);
  year = year + (month <= 2 ? 1 : 0);
  return {
    year,
    month,
    day,
    dayOfYear,
    weekday: (dayOfEra >= -4 ? (dayOfEra + 4) % 7 : (dayOfEra + 5) % 7 + 6 )
  };
};
const getWeekDayFromUnixMillis = (unixMillis) => {
  let unix = Math.round(unixMillis / 1000);
  // let s = 1313905026;
  let shifted = Math.floor(unix / 86400) + 719468;
  let era = Math.floor((shifted >= 0 ? shifted : shifted - 146096) / 146097);
  let dayOfEra = shifted - era * 146097;
  console.log("DOE:", dayOfEra, (dayOfEra >= -4 ? (dayOfEra + 4) % 7 : (dayOfEra + 5) % 7 + 6 ))
  return (dayOfEra >= -4 ? (dayOfEra + 4) % 7 : (dayOfEra + 5) % 7 + 6 );
};
const daysInMonths = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const isLeapYear = (year) => {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
};
const isLeapYearUnixMillis = (unixMillis) => {
  let time = getTimeFromUnixMillis(unixMillis);
  return isLeapYear(time.year);
};
const lastDayOfMonth = (year, month) => {
  if (isLeapYear(year)) {
    if (month === 2) {
      return 29;
    }
  }
  return daysInMonths[month - 1];
};
const lastDayOfMonthUnixMillis = (unixMillis) => {
  let time = getTimeFromUnixMillis(unixMillis);
  if (isLeapYear(time.year)) {
    if (time.month === 2) {
      return 29;
    }
  }
  return daysInMonths[time.month - 1];
};
const firstDayOfMonthUnixMillis = (unixMillis) => {
  let time = getTimeFromUnixMillis(unixMillis);
  return unixMillis - time.day * millisInDay;
};

const millisInDay = 86400000;

export {
  getDaysInMonth,
  getFirstDayInMonth,
  getWeekDay,
  isWeekEnd,
  getNextDay,
  getPreviousDay,
  getNextMonth,
  getPreviousMonth,
  getTimeFromUnixMillis,
  weekDayDifference,
  isLeapYear,
  isLeapYearUnixMillis,
  lastDayOfMonth,
  lastDayOfMonthUnixMillis,
  daysInMonths,
  firstDayOfMonthUnixMillis,
  getWeekDayFromUnixMillis,
  addCurrentTimeHours
};
