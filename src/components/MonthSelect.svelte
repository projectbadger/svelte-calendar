<script>
    import Close from './Close.svelte';
    import Save from './Save.svelte';
    import { createEventDispatcher } from 'svelte';
    // export let currentDate = new Date(1970, 1, 1);
    // export let value = currentDate;
    const dispatch = createEventDispatcher();
    const setEvent = (monthNum) => {
        console.log("Dispathcing month select", monthNum);
        if(monthNum === 0) {
            monthNum = month;
        }
        dispatch('close', {
            month: monthNum,
        });
    }
    export let month = 1;
    let oMonth = month;
    export let monthsToDisplay = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December"
    ];
</script>

<style>
    select {
        background-color: inherit;
        width: 90%;
    }
</style>

<div class="year-select-container">
    <div>
        <Close on:click={() => setEvent(oMonth)} />
        <Save on:click={() => setEvent(0)} />
    </div>
    <div class="month-div">
        <select name="monthinput" bind:value={month}>
        {#each monthsToDisplay as cMonth, index}
                <option value={index+1} on:change={() => setEvent(index+1)}>{cMonth}</option>
        {/each}
        </select>
    </div>
</div>