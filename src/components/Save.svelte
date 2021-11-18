<script>
  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();
  const setEvent = () => {
    console.log("save clicked");
    dispatch("click");
  };
</script>

<span class="action save" on:click={() => setEvent()} />

<style>
  .action {
    display: inline-block;
    position: relative;
    cursor: pointer;
    margin: 1rem;
    font-size: 5rem;
    padding: 0;
    width: 3rem;
    height: 3rem;
  }
  .save {
    /* position: relative; */
    display: inline-block;
    /* float: center; */
    /* width: 3rem;
        height: 3rem; */
  }
  .save:before,
  .save:after {
    position: absolute;
    left: 0;
    transform: translateX(1rem) rotate(-45deg);
    background-color: black;
    content: "";
    transform-origin: left bottom;
  }
  .save:before {
    top: 45%;
    height: 45%;
    width: 0.5rem;
  }
  .save:after {
    bottom: 10%;
    height: 0.5rem;
    width: 90%;
  }
</style>
