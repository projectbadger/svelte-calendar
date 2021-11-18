<script>
  import TimePoint from "../components/TimePoint.svelte";
  export let unix = -1;
  export let hour = -1;
  export let minute = -1;
  export let second = -1;
  export let classes = "";
</script>

<div>
  <TimePoint bind:unix bind:hour bind:minute bind:second bind:classes />
</div>
