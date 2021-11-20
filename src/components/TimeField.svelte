<script>
  import Time from "./Time.svelte";
  import { onMount, createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();
  export let unix = -1;
  export let hour = -1;
  export let minute = -1;
  export let second = -1;
  export let classes = "";
  export let text = "Time";
  export let unixMillis = 0;
  export let adjustToNow = true;
  export let position = {
    top: "",
    bottom: "",
    left: "",
    right: "",
  };
  let left = false;
  let clientWidth;
  let viewX;
  export let positionCss = "";
  const getPositionCss = () => {
    let str = "";
    if (position.top !== "") {
      str += "top:" + position.top + ";";
    }
    if (position.bottom !== "") {
      str += "bottom:" + position.bottom + ";";
    }
    if (position.left !== "") {
      str += "left:" + position.left + ";";
    }
    if (position.right !== "") {
      str += "right:" + position.right + ";";
    }
    positionCss = str;
    return str;
  };
  const emitChange = (e) => {
    dispatch("change", e.detail);
  };
  onMount(() => {
    getPositionCss();
    if (adjustToNow) {
      if (hour > 0 && minute > 0 && second > 0) {
        return;
      }
      let time = new Date();
      let timeNow = new Date();
      if (unixMillis > 0) {
        time.setTime(unixMillis);
        if (hour > 0 && minute > 0 && second > 0) {
          return;
        }
      }
      time.setHours(timeNow.getHours());
      time.setMinutes(timeNow.getMinutes());
      time.setSeconds(timeNow.getSeconds());
      unixMillis = time.getTime();
      hour = time.getHours();
      minute = time.getMinutes();
      second = time.getSeconds();
    }
  });
</script>

<div class="tp-container">
  <div
    class="tm-container"
    style="{positionCss}{position.top !== ''
      ? 'top:' + position.top + ';'
      : ''}{position.bottom !== ''
      ? 'bottom:' + position.bottom + ';'
      : ''}{position.left !== ''
      ? 'left:' + position.left + ';'
      : ''}{position.right !== '' ? 'right:' + position.right + ';' : ''}"
  >
    <div class="time">
      <p>{text}</p>
      <Time
        bind:unix
        bind:hour
        bind:minute
        bind:second
        bind:classes
        bind:unixMillis
        on:change={(e) => emitChange(e)}
      />
    </div>
    <div />
  </div>
</div>

<style>
  .tp-container {
    position: relative;
    width: 100%;
  }
  .tm-container {
    display: block;
    position: absolute;
    background-color: var(--clr-bg);
    z-index: 99;
    top: 0;
    left: 0;
    right: 0;
    border: 1px solid black;
    align-self: 7px;
    border-radius: 5px;
  }
  .time {
    display: flex;
    flex-direction: column;
    align-items: center;
    background-color: var(--clr-bg);
    padding: 1rem;
    border-radius: 5px;
  }
</style>
