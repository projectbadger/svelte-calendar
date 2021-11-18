<script>
  import { createEventDispatcher, onMount } from "svelte";
  import Day from "./Day.svelte";
  import TimePoint from "./TimePoint.svelte";

  // export let day = 1;
  // export let month = 1;
  // export let year = 1970;
  // export let date = new Date();
  export let weekday = "";
  export let inactive = false;
  export let holiday = false;
  export let events = [];
  export let unixValue = false;
  export let unixMillis = 0;
  export let hour = 0;
  export let minute = 0;
  export let second = 0;
  if (hour === 0 && minute === 0 && second === 0) {
    let cDate = new Date();
    hour = cDate.getHours();
    minute = cDate.getMinutes();
    second = cDate.getSeconds();
  }
  let container;
  let showTime = false;
  const DISPLAY_LEFT = 0b00000001;
  const DISPLAY_RIGHT = 0b00000010;
  const DISPLAY_CENTER = 0b00000100;
  let displayMask = DISPLAY_CENTER;
  let timePointPosition = {
    top: "",
    bottom: "",
    left: "",
    right: "",
  };
  let value = 0;
  let timePositionCss = "";

  const alignNumber = () => {
    let offset = container.getBoundingClientRect();
    let viewX = document.documentElement.clientWidth;
    let viewY = document.documentElement.clientHeight;
    if (offset.x < viewX / 2) {
      displayMask = DISPLAY_LEFT;
      timePositionCss = "right:100%;";
      timePointPosition.left = "100%";
      timePointPosition.right = "";
    } else {
      timePositionCss = "right:0;";
      timePointPosition.left = "0%";
      timePointPosition.right = "";
      displayMask = DISPLAY_RIGHT;
    }
    // console.log(offset, viewX, viewY);
  };

  const dispatch = createEventDispatcher();
  const dayClicked = (event) => {
    dispatch("day-click", event.detail);
    console.log("Position: ", timePointPosition);
    showTime = true;
    setCloseListener(true);
  };

  const onTimeChange = (e) => {
    let newTimeDate = new Date();
    newTimeDate.setTime(e.detail);
    unixMillis = e.detail;
    hour = newTimeDate.getHours();
    minute = newTimeDate.getMinutes();
    second = newTimeDate.getSeconds();
    if (unixValue) {
      dispatch("day-click", e.detail / 1000);
    } else {
      dispatch("day-click", newTimeDate);
    }
  };
  const closeTimePicker = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (container.contains(e.target)) {
      return;
    }
    console.log("Closing Time display");

    // if(e.target.contains())
    showTime = false;
    setCloseListener(false);
  };
  const setCloseListener = (active = true) => {
    if (active) {
      document.addEventListener("click", closeTimePicker);
      console.log("Added listener");
    } else {
      document.removeEventListener("click", closeTimePicker);
      console.log("Removed listener");
    }
  };

  onMount(() => {
    alignNumber();
  });
</script>

<div bind:this={container}>
  <Day
    bind:weekday
    bind:inactive
    bind:holiday
    bind:events
    bind:unixValue
    bind:unixMillis
    on:day-click={(e) => dayClicked(e)}
  />
  {#if showTime}
    {#if displayMask | DISPLAY_LEFT}
      <TimePoint
        bind:hour
        bind:minute
        bind:second
        bind:unixMillis
        bind:timePointPosition
        on:change={(e) => onTimeChange(e)}
        positionCss="right:100%;"
        bind:unix={unixValue}
      />
    {:else if displayMask | DISPLAY_RIGHT}
      <TimePoint
        bind:hour
        bind:minute
        bind:second
        bind:unixMillis
        bind:timePointPosition
        on:change={(e) => onTimeChange(e)}
        positionCss="right:0;"
        bind:unix={unixValue}
      />
    {/if}
  {/if}
</div>

<style>
</style>
