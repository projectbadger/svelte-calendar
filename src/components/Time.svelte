<script>
  import { createEventDispatcher, onMount } from "svelte";
  import { addCurrentTimeHours } from '../utils/unixTime.js'

  export let unix = -1;
  export let hour = -1;
  export let minute = -1;
  export let second = -1;
  export let unixMillis = 0;
  export let classes = "";
  export let showSeconds = false;

  const nowUnix = Math.floor(Date.now() / 1000);
  const nowSeconds = nowUnix % 60;
  let nowUnixMinutes = (nowUnix - nowSeconds) / 60;
  const nowMinutes = nowUnixMinutes % 60;
  let nowUnixHours = (nowUnixMinutes - nowMinutes) / 60;
  const nowHours = nowUnixHours % 24;

  let dateObj = new Date();
  if(unixMillis > 0) {
    unixMillis = addCurrentTimeHours(unixMillis, hour, minute, second);
    dateObj.setTime(unixMillis);

  }
  if (hour <= 0) {
      hour = nowHours;
    } else {
      hour = hour % 24;
      dateObj.setHours(hour);
    }
    if (minute <= 0) {
      minute = nowMinutes;
    } else {
      minute = minute % 60;
      dateObj.setMinutes(minute);
    }
    if (second <= 0) {
      second = nowSeconds;
    } else {
      second = second % 60;
      dateObj.setSeconds(second);
    }
    if(hour === 0 && minute === 0) {
     dateObj.setHours(nowHours);
     dateObj.setMinutes(nowMinutes);
     dateObj.setSeconds(nowSeconds)
     hour = dateObj.getHours();
     minute = dateObj.getMinutes();
     second = dateObj.getSeconds();
    }
    unixMillis = dateObj.getTime();

  onMount(() => {
    // dateObj = new Date();
    let nowObj = new Date();
    if (unixMillis <= 0) {
      unixMillis = Math.floor(dateObj.getTime() / 1000);
    } else {
      dateObj.setTime(unixMillis);
    }
    if (hour < 0) {
      hour = dateObj.getHours();
    } else if(dateObj.getHours() === 0) {
      dateObj.setHours(hour);
    } else {
      hour = hour % 24;
      dateObj.setHours(hour);
    }
    if (minute < 0) {
      minute = dateObj.getMinutes();
    } else if(dateObj.getMinutes() === 0) {
      dateObj.setMinutes(minute);
    } else {
      minute = minute % 60;
      dateObj.setMinutes(minute);
    }
    if (second < 0) {
      second = dateObj.getSeconds();
    } else if(dateObj.getSeconds() === 0) {
      dateObj.setSeconds(second);
    } else {
      second = second % 60;
      dateObj.setSeconds(second);
    }
    if (unix <= 0) {
      unix = Math.floor(dateObj.getTime() / 1000);
    } else {
      // dateObj.setTime(unix * 1000);
    }
    changeSecond(0);
    if(hour === 0 && minute === 0) {
     dateObj.setHours(nowObj.getHours());
     dateObj.setMinutes(nowObj.getMinutes());
     dateObj.setSeconds(nowObj.getSeconds())
     hour = dateObj.getHours();
     minute = dateObj.getMinutes();
     second = dateObj.getSeconds();
    }
    unixMillis = dateObj.getTime();
    console.log(dateObj, hour, minute, second, unix);
  });

  const dispatch = createEventDispatcher();

  export let showOptions = false;

  const changeHour = (factor) => {
    hour = hour + factor;
    dateObj.setHours(hour);
    second = dateObj.getSeconds();
    minute = dateObj.getMinutes();
    hour = dateObj.getHours();
    unix = Math.floor(dateObj.getTime() / 1000);
    emitChange();
    unixMillis = unixMillis + 1000 * 60 * 60 * factor;
  };
  const changeMinute = (factor) => {
    minute = minute + factor;
    dateObj.setMinutes(minute);
    second = dateObj.getSeconds();
    minute = dateObj.getMinutes();
    hour = dateObj.getHours();
    unix = Math.floor(dateObj.getTime() / 1000);
    unixMillis = unixMillis + 1000 * 60 * factor;
    emitChange();
  };
  const changeSecond = (factor) => {
    second = second + factor;
    dateObj.setSeconds(second);
    second = dateObj.getSeconds();
    minute = dateObj.getMinutes();
    hour = dateObj.getHours();
    unix = Math.floor(dateObj.getTime() / 1000);
    unixMillis = unixMillis + 1000 * factor;
    emitChange();
  };
  // changeSecond(0);
  const emitChange = (e) => {
    // dispatch("change", { hour, minute, second });
    dispatch("change", unixMillis);
    let d = new Date();
    d.setTime(unixMillis);
    console.log("Emmitting unix Millis for:", d);
    // showOptions = true;
  };
</script>

<span class="cols time-container {classes}">
  <div class="rows hours-container">
    <div
      class="increment tr-inc-dec-trigger"
      on:click|preventDefault={() => changeHour(1)}
    >
      <span class="triangle tr-up tr-inc-dec-trigger" />
    </div>
    <input
      class="number"
      type="number"
      bind:value={hour}
      on:change|preventDefault={(e) => changeHour(0)}
    />
    <div
      class="decrement tr-inc-dec-trigger"
      on:click|preventDefault={() => changeHour(-1)}
    >
      <span class="triangle tr-down tr-inc-dec-trigger" />
    </div>
  </div>
  <div>
    <p>:</p>
  </div>
  <div class="rows minutes-container">
    <div
      class="increment tr-inc-dec-trigger"
      on:click|preventDefault={() => changeMinute(1)}
    >
      <span class="triangle tr-up tr-inc-dec-trigger" />
    </div>
    <input
      class="number"
      type="number"
      bind:value={minute}
      on:change|preventDefault={(e) => changeMinute(0)}
    />
    <div
      class="decrement tr-inc-dec-trigger"
      on:click|preventDefault={() => changeMinute(-1)}
    >
      <span class="triangle tr-down tr-inc-dec-trigger" />
    </div>
  </div>
  {#if showSeconds}
  <div>
    <p>:</p>
  </div>
  <div class="rows seconds-container">
    <div
      class="increment tr-inc-dec-trigger"
      on:click|preventDefault={() => changeSecond(1)}
    >
      <span class="triangle tr-up tr-inc-dec-trigger" />
    </div>
    <input
      class="number"
      type="number"
      bind:value={second}
      on:change|preventDefault={(e) => changeSecond(0)}
    />
    <div
      class="decrement tr-inc-dec-trigger"
      on:click|preventDefault={() => changeSecond(-1)}
    >
      <span class="triangle tr-down tr-inc-dec-trigger" />
    </div>
  </div>
  {/if}
</span>

<style>
  /* Style items (options): */
  .increment,
  .decrement,
  .number {
    background-color: var(--clr-bg);
    /* position: absolute;
        z-index: 99; */
  }
  .increment {
    /* top: 100%; */
    bottom: 100%;
    /* left: 40%;
        right: 40%; */
    left: 0;
    right: 0;
    /* transform: translateY(-200%); */
  }
  .decrement {
    top: 100%;
    /* left: 45%;
        right: 45%; */
    left: 0;
    right: 0;
  }
  .decrement:hover,
  .increment:hover {
    background-color: var(--clr-bg-h);
  }
  .increment span,
  .decrement span {
    position: relative;
    cursor: pointer;
    height: inherit;
    /* margin: 0; */
    /* padding: 0; */
  }
  .number {
    text-decoration: none;
    box-sizing: border-box;
    -moz-appearance: textfield;
    appearance: textfield;
    margin: 0;
    /* margin-top: 0.5rem; */
    padding: 0;
    width: 100%;
    height: 100%;
    border: none;
    border-radius: 0%;
    text-align: center;
  }
  .number:focus,
  .number:target,
  .number:hover {
    border: none;
    background-color: var(--clr-bg-h);
  }
  .number::-webkit-inner-spin-button,
  .number::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
    padding: 0;
    border: none;
  }
  .triangle {
    display: inline-block;
    width: 0;
    height: 0;
    border-left: 0.4em solid transparent;
    border-right: 0.4em solid transparent;
    /* margin-top: 0.8rem; */
  }
  .tr-up {
    border-bottom: 0.8em solid #555;
  }
  .tr-down {
    border-top: 0.8em solid #555;
  }
  .tr-inc-dec-trigger {
    cursor: pointer;
  }
  .time-container {
    position: relative;
    display: inline-block;
    width: auto;
    margin: 0;
    padding: 0;
    /* display: grid;
        grid-template-columns: auto auto auto; */
  }
  .cols {
    display: flex;
    flex-direction: row;
    align-items: center;
    text-align: center;
  }
  .rows {
    display: flex;
    flex-direction: column;
    width: 2rem;
  }
</style>
