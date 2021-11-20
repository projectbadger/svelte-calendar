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
  import DaysGenerator from "../utils/generateDays.js";
  import { getWeekDays } from "../utils/i18n";
  import { createEventDispatcher, onMount } from "svelte";
  //   import Day from "./Day.svelte";

  export let date = new Date();
  export let month = 1;
  export let year = 1970;
  export let firstDayOrder = 1;
  export let unixValue = false;
  export let unixMillis = 0;
  export let setDays = true;

  const dispatch = createEventDispatcher();

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
    unixMillis = date.getTime();
  }

  const daysGenerator = new DaysGenerator(unixMillis, firstDayOrder, true);
  daysGenerator.fillDayHeaders();
  if(setDays) {
    daysGenerator.setDays();
  }


  const dayClicked = (date) => {
    if (date !== null) {
      dispatch("day-click", date);
    }
  };

  let clientWidth = 0;
  onMount(() => {
    // clientWidth =
  });
</script>

<div class="month" bind:clientWidth>
  <div class="days">
    {#each daysGenerator.getDayHeaders() as day, index}
      {#if clientWidth < 720}
        <div class="day-header" title={day} data-index={index}>
          {day.charAt(0)}
        </div>
      {:else}
        <div class="day-header" title={day} data-index={index}>
          {day}
        </div>
      {/if}
    {/each}
  </div>
  <div class="days">
    <slot>
      {#each daysGenerator.getDays() as day}
        <DayWithEvent
          weekday={day.weekday}
          inactive={day.inactive}
          holiday={day.holiday}
          unixMillis={day.unixMillis}
          {unixValue}
          on:day-click={(e) => dayClicked(e.detail)}
        />
      {/each}
    </slot>
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
