<script>
  import { createEventDispatcher } from "svelte";

  //   export let date = new Date();
  //   export let day = 1;
  //   export let month = 1;
  //   export let year = 1970;
  export let weekday = "";
  export let inactive = false;
  export let holiday = false;
  //   export let setTime = true;
  //   export let setTimeRange = true;
  export let events = [];
  export let unixValue = false;
  export let unixMillis = 0;

  //   const date = new Date(year, month - 1, day);

  const dispatch = createEventDispatcher();
  const click = () => {
    if (unixValue) {
      dispatch("day-click", unixMillis / 1000);
    } else {
      let date = new Date();
      date.setTime(unixMillis);
      dispatch("day-click", date);
    }
  };
  const getDate = () => {
    let date = new Date(unixMillis);
    date.setTime(unixMillis);
    return date.getDate();
  };
</script>

<div
  class="day {inactive ? 'inactive' : ''} {holiday ? 'holiday' : ''}"
  on:click={click}
>
  <div>
    <div class="description">
      <span>{getDate()}</span>
      {#if weekday}
        <!-- <span>{weekday}</span> -->
      {/if}
      <!-- <span>{date.getDay()}</span> -->
    </div>
    <div class="events">
      {#if events.length}
        <ul>
          {#each events as event}
            <li>
              <div class="event">
                {event.name}
              </div>
            </li>
          {/each}
        </ul>
      {/if}
    </div>
    <slot />
  </div>
</div>

<style>
  .day {
    box-sizing: border-box;
    display: block;
    position: relative;
    width: 100%;
    border: 1px solid black;
    border-radius: 5px;
    overflow: hidden;
    cursor: pointer;
  }
  .day:after {
    content: "";
    display: block;
    padding-bottom: 100%;
  }
  .day:hover,
  .day:focus {
    background-color: var(--clr-bg-h);
  }
  .day > div {
    display: flex;
    flex-direction: column;
    position: absolute;
    margin: 0;
    width: 100%;
    height: 100%;
    left: 0;
    top: 0;
  }
  .inactive {
    background-color: var(--clr-bg-d);
  }
  .holiday {
    background-color: var(--clr-bg-hol);
  }
  .description {
    margin-bottom: 0.5rem;
  }
  .events {
    display: block;
    flex-direction: column-reverse;
  }
  .events ul,
  .events li {
    margin: 0;
    padding: 0;
  }
  .events > ul {
    list-style: none;
    text-align: middle;
  }
  .event {
    border-radius: 5px;
    cursor: pointer;
  }
  .event:hover {
    background-color: var(--clr-bg-h);
  }
</style>
