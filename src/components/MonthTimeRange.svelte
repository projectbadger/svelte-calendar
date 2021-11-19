<script context="module">
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
</script>

<script>
  import DayWithEvent from "./DayWithEvent.svelte";
  import {
      getDaysInMonth,
      getFirstDayInMonth,
      getWeekDay,
      isWeekEnd,
      getNextDay,
      getPreviousDay,
      getNextMonth
  } from '../utils/unixTime.js';
  import { createEventDispatcher, onMount } from "svelte";
  //   import Day from "./Day.svelte";

  export let date = new Date();
  export let month = 1;
  export let year = 1970;
  export let firstDayOrder = 1;
  export let unixValue = false;
  export let unixMillis = 0;

  const dispatch = createEventDispatcher();

  let days = [];
  let dayHeaders = [];
  // Ensure numbers;
  month = month - 0;
  year = year - 0;
  firstDayOrder = firstDayOrder - 0;
  if (unixMillis > 0) {
    date.setTime(unixMillis);
    month = date.getMonth() + 1;
    year = date.getFullYear();
    console.log("Set unixMillis in Month", month, year, unixMillis);
  } else {
    date.setFullYear(year, month - 1);
  }

  export let i18n = {
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

  const dayClicked = (date) => {
    if (date !== null) {
      dispatch("day-click", date);
    }
  };
  const fillDayHeaders = () => {
    let orderIndex = firstDayOrder;
    dayHeaders = [];
    for (let i = 0; i < 7; i++) {
      let weekDayIndex = (orderIndex + i) % 7;
      dayHeaders.push({
        index: orderIndex,
        name: i18n.weekdays[weekDayIndex],
      });
    }
    dayHeaders = [...dayHeaders];
  };
  const setDays = (unixMillis) => {
    const numDays = getDaysInMonth(unixMillis);
    const firstMonthDay = getFirstDayInMonth(unixMillis);
    let monthDays = [];
    let currentDay = firstMonthDay;
    console.log("current; first; numDays", currentDay, firstMonthDay, numDays);
    for (let i = 1; i <= numDays; i++) {
      monthDays.push({
        weekday: getWeekDay(currentDay),
        inactive: false,
        holiday: isWeekEnd(currentDay),
        // holiday: false,
        unixMillis: currentDay,
      });
      currentDay = getNextDay(currentDay);
    }
    let orderDiff = getWeekDay(firstMonthDay) - firstDayOrder;
    if (orderDiff < 0) {
      orderDiff = orderDiff + 7;
    }
    currentDay = firstMonthDay;
    for (let i = orderDiff; i > 0; i--) {
      currentDay = getPreviousDay(currentDay);
      monthDays = [
        {
          weekday: getWeekDay(currentDay),
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
      monthDays.push({
        weekday: getWeekDay(currentDay),
        inactive: true,
        // holiday: isWeekEnd(currentDay),
        holiday: false,
        unixMillis: currentDay,
      });
      currentDay = getNextDay(currentDay);
    }
    days = monthDays;
  };
  fillDayHeaders();
  setDays(unixMillis);

  let clientWidth = 0;
  onMount(() => {
    // clientWidth =
  });
</script>

<div class="month" bind:clientWidth>
  <div class="days">
    {#each dayHeaders as day}
      {#if clientWidth < 720}
        <div class="day-header" title={day.name} data-index={day.index}>
          {day.name.charAt(0)}
        </div>
      {:else}
        <div class="day-header" title={day.name} data-index={day.index}>
          {day.name}
        </div>
      {/if}
    {/each}
  </div>
  <div class="days">
    {#if days.length}
      {#each days as day}
        <DayWithEvent
          weekday={day.weekday}
          inactive={day.inactive}
          holiday={day.holiday}
          unixMillis={day.unixMillis}
          {unixValue}
          on:day-click={(e) => dayClicked(e.detail)}
        />
      {/each}
    {/if}
  </div>
</div>

<style>
  .month {
    display: block;
  }
  .days {
    display: grid;
    /* grid-template-columns: auto auto auto auto auto auto auto; */
    grid-template-columns: 14.28% 14.28% 14.28% 14.28% 14.28% 14.28% 14.28%;
    grid-gap: 0px;
  }
  .day-header {
    box-sizing: border-box;
    display: block;
    position: relative;
    width: 100%;
    overflow: hidden;
  }
</style>
