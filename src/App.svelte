<script>
  import Calendar from "./views/Calendar.svelte";
  import TimeView from "./views/TimeView.svelte";
  export let name;
  let value1, value2, value3;
  let hour, minute, second, unix;
  // second = 6;
</script>

<main>
  <h1>Hello {name}!</h1>
  <p>
    Visit the <a href="https://svelte.dev/tutorial">Svelte tutorial</a> to learn
    how to build Svelte apps.
  </p>
  <p>Value 1: {value1}</p>
  <p>Value 2: {value2}</p>
  <p>Value 3: {value3}</p>
  <p>Hour: {hour}</p>
  <p>Minute: {minute}</p>
  <p>Second: {second}</p>
  <p>Unix: {unix}</p>
  <Calendar firstDayOrder="1" bind:value={value1} />
  <Calendar firstDayOrder="6" unixValue={true} bind:value={value2} />
  <div style="width: 200px">
    <Calendar firstDayOrder="1" unixValue={true} bind:value={value3} />
  </div>
</main>

<style>
  main {
    text-align: center;
    padding: 1em;
    /* max-width: 240px; */
    margin: 0 auto;
  }

  h1 {
    color: #ff3e00;
    text-transform: uppercase;
    font-size: 4em;
    font-weight: 100;
  }

  @media (min-width: 640px) {
    main {
      max-width: none;
    }
  }
</style>
