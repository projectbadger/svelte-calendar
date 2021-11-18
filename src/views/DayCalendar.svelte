<script>
  import MonthView from "./MonthView.svelte";

  export let year = 0;
  export let month = 0;
  export let day = 0;
  export let classes = {
    colorBg: "#fff",
    colorBgDisabled: "rgb(133, 151, 161)",
    colorBgHover: "rgb(185, 209, 224)",
    colorBgHoliday: "rgba(0, 0, 0, 0.1)",
  };
  if (year === 0 || month === 0 || day === 0) {
    let currentDate = new Date();
    if (year === 0) {
      year = currentDate.getFullYear();
    }
    if (month === 0) {
      month = currentDate.getMonth() + 1;
    }
    if (day === 0) {
      day = currentDate.getDate();
    }
  }
  export let value = 0;
  export let firstDayOrder = 3;
  export let unixValue = false;

  const getCssVariablesString = () => {
    console.log("Setting css vars");
    return (
      "--clr-bg:" +
      classes.colorBg +
      ";" +
      "--clr-bg-d:" +
      classes.colorBgDisabled +
      ";" +
      "--clr-bg-h:" +
      classes.colorBgHover +
      ";" +
      "--clr-bg-hol:" +
      classes.colorBgHoliday
    );
  };
  const setDayValue = (e) => {
    value = e.detail;
    console.log(value);
  };
</script>

<div
  class="calendar"
  style={getCssVariablesString()}
  data-calendartarget="calendar"
>
  <MonthView
    {firstDayOrder}
    {unixValue}
    bind:year
    bind:month
    bind:value
    on:day-click={(e) => setDayValue(e)}
  />
</div>

<style>
  .calendar {
    padding: 0.2rem;
    border: solid 1px black;
    border-radius: 5px;
  }
</style>
