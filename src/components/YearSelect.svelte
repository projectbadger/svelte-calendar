<script>
    import Close from './Close.svelte';
    import Save from './Save.svelte';
    import { createEventDispatcher } from 'svelte';
    // export let currentDate = new Date(1970, 1, 1);
    // export let value = currentDate;
    let yearsToDisplay = [];
    const dispatch = createEventDispatcher();
    const setEvent = (yearNum) => {
        // console.log("Day.svelte: clicked", day, month, year);
        // dispatch('selected', {
        //     month: monthNum,

        // });
        console.log("Dispathcing year select", yearNum);
        dispatch('close', {
            year: yearNum
        });
    }
    export let year = 1970;
    let oYear = year;
</script>

<style>

</style>

<div class="year-select-container">
    <Close on:click={() => setEvent(oYear)} />
    <Save on:click={() => setEvent(year)} />
    <div class="year-div">
        {year}
        <form on:submit={() => setEvent(year)}>
            <input type="number" name="yearinput" bind:value={year} >
        </form>
    </div>
</div>