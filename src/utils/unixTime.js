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

  const millisInDay = 86400000;

  export {
      getDaysInMonth,
      getFirstDayInMonth,
      getWeekDay,
      isWeekEnd,
      getNextDay,
      getPreviousDay,
      getNextMonth,
      getPreviousMonth
  }