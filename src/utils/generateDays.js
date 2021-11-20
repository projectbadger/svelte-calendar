import {
  getDaysInMonth,
  getFirstDayInMonth,
  getWeekDay,
  isWeekEnd,
  getNextDay,
  getPreviousDay,
  getNextMonth,
  lastDayOfMonth,
  getTimeFromUnixMillis,
  weekDayDifference,
  firstDayOfMonthUnixMillis
} from "./unixTime.js";
import { getWeekDayByIndex, getWeekDays } from "./i18n.js";

class DaysGenerator {
  dayHeaders = [];
  days = [];
  events = [];
  firstDayOrder = 0;
  constructor(unixMillis = Date.now(), firstDayOrder = 0, manualSet = true) {
    this.unixMillis = unixMillis;
    this.firstDayOrder = firstDayOrder;
    if (!manualSet) {
      this.fillDayHeaders();
      this.setDays();
    }
  }
  getEventsFunc = () => {
    return [];
  };
  setEvent = (event = null) => {
    if (event !== null) {
      if (typeof event.id !== "undefined") {
        if (this.getEvent(event.id) === null) {
          this.events.push(event);
        } else {
          this.events[event.id] = event;
        }
      }
    }
    return false;
  };
  getEvent = (eventId) => {
    length = this.events.length;
    for (let i = 0; i < length; i++) {
      if (eventId === events[i].id) {
        return events[i];
      }
    }
    // Not found
    return null;
  };
  setFirstDayOrder = (index) => {
    this.firstDayOrder = index;
  };
  getDayHeaders = () => {
    return this.dayHeaders;
  };
  fillDayHeaders = () => {
    // let i18nWeekDays = getWeekDays();
    let orderIndex = this.firstDayOrder;
    this.dayHeaders = [];
    for (let i = 0; i < 7; i++) {
      let weekDayIndex = (orderIndex + i) % 7;
      this.dayHeaders.push(getWeekDayByIndex(weekDayIndex));
      //   this.dayHeaders.push({
      //     index: orderIndex,
      //     name: getWeekDayByIndex(weekDayIndex),
      //   });
    }
  };
  setFuncGetEvents = (
    func = () => {
      getEventFunc = func;
    }
  ) => {
    this.getEventsFunc = func;
  };
  getDays = () => {
    return this.days;
  };
  setDays = () => {
    const numDays = getDaysInMonth(this.unixMillis);
    const firstMonthDay = getFirstDayInMonth(this.unixMillis);
    const time = getTimeFromUnixMillis(this.unixMillis);
    // const numDays = lastDayOfMonth(time.year, time.month)
    let monthDays = [];
    let currentDay = firstMonthDay;
    console.log("current; first; numDays", currentDay, firstMonthDay, numDays);
    for (let i = 1; i <= numDays; i++) {
      let weekDay = getWeekDay(currentDay);
      monthDays.push({
        weekday: weekDay,
        weekDayName: getWeekDayByIndex(weekDay),
        inactive: false,
        holiday: isWeekEnd(currentDay),
        // holiday: false,
        unixMillis: currentDay,
      });
      currentDay = getNextDay(currentDay);
    }
    let orderDiff = getWeekDay(firstMonthDay) - this.firstDayOrder;
    if (orderDiff < 0) {
      orderDiff = orderDiff + 7;
    }
    currentDay = firstMonthDay;
    for (let i = orderDiff; i > 0; i--) {
      currentDay = getPreviousDay(currentDay);
      let weekDay = getWeekDay(currentDay);
      monthDays = [
        {
          weekday: weekDay,
          weekDayName: getWeekDayByIndex(weekDay),
          inactive: true,
          // holiday: isWeekEnd(currentDay),
          holiday: false,
          unixMillis: currentDay,
        },
        ...monthDays,
      ];
    }
    let nextMonthDiff = 7 - (monthDays.length % 7);
    if (nextMonthDiff === 7) {
      nextMonthDiff = 0;
    }
    currentDay = getNextMonth(firstMonthDay);
    for (let i = 0; i < nextMonthDiff; i++) {
      let weekDay = getWeekDay(currentDay);
      monthDays.push({
        weekday: weekDay,
        weekDayName: getWeekDayByIndex(weekDay),
        inactive: true,
        // holiday: isWeekEnd(currentDay),
        holiday: false,
        unixMillis: currentDay,
      });
      currentDay = getNextDay(currentDay);
    }
    this.days = monthDays;
  };
}

DaysGenerator.prototype.millisInWeek = 604800000;
DaysGenerator.prototype.millisInDay = 86400000;
DaysGenerator.prototype.millisInHour = 3600000;

DaysGenerator.prototype.getDaysInMonth = function (unixMillis) {};

export default DaysGenerator;
