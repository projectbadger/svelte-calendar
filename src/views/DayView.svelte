<script>
  import { createEventDispatcher } from "svelte";

  export let events = [];
  export let year = 1970;
  export let month = 1;
  export let day = 1;

  const dispatch = createEventDispatcher();
  const click = () => {
    // console.log("Day.svelte: clicked", day, month, year);
    dispatch("day-click", { day: day, month: month, year: year });
  };

  let date = new Date(year, month, day);
</script>

<div on:click={click()}>
  <div class="description">
    <span><i class="arrow left" /></span>
    <span>{date.toValue()}</span>
    <span><i class="arrow right" /></span>
  </div>
  <div class="events">
    {#each events as event}
      <div>
        <span>{event.name}</span>
      </div>
    {/each}
  </div>
</div>

<style>
  .arrow {
    border: solid black;
    border-width: 0 3px 3px 0;
    display: inline-block;
    padding-top: 3px;
    padding-bottom: 3px;
    bottom: 0;
    top: auto;
  }

  .description span {
    align-items: center;
    justify-content: center;
  }

  .right {
    float: right;
    transform: rotate(-45deg);
    -webkit-transform: rotate(-45deg);
  }

  .left {
    float: left;
    transform: rotate(135deg);
    -webkit-transform: rotate(135deg);
  }

  /* .h3m {
        margin-bottom: 0;
    } */
</style>
