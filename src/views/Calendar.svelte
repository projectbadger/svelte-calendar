<script>
    import MonthView from './MonthView.svelte';
    import DayView from './DayView.svelte';
    export let year = 0;
    export let month = 0;
    export let day = 0;
    if(year === 0 || month === 0 || day === 0) {
        let currentDate = new Date();
        if(year === 0) {
            year = currentDate.getFullYear();
        }
        if(month === 0) {
            month = currentDate.getMonth()+1;
        }
        if(day === 0) {
            day = currentDate.getDate();
        }
    }
    export let value = 0;
    export let view = 0b00000010;
    export let firstDayOrder = 3;
    export let unixValue = false;

    const setYearView = () => {
        view = 0b00000001;
    }
    const setMonthView = () => {
        view = 0b00000010;
    }
    const setDayView = (e) => {
        console.log("Setting day view", e);
        view = 0b00000100;
    }
    const setEventView = () => {
        view = 0b00000001;
    }
</script>

<style>
    .calendar {
        padding: 0.2rem;
        border: solid 1px black;
        border-radius: 5px;
    }
</style>

<div class="calendar">
    <MonthView
        firstDayOrder={firstDayOrder}
        unixValue={unixValue}
        bind:year={year}
        bind:month={month}
        bind:value={value}
        on:day-click={(e)=>setDayView(e)}
        />
</div>