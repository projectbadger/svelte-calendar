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
  }
  .tm-container {
    display: block;
    position: absolute;
    /* background-color: var(--clr-bg); */
    z-index: 99;
    bottom: 100%;
    /* right: 0; */
    border: 1px solid black;align-self: 7px;
  }
  .time {n3m3f00k
    background-color: var(--clr-bg);
  }
</style>
