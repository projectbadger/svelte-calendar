<script context="module">
    const dateIncrementDay = (date) => {
        date.setDate(date.getDate()+1);
    }
    const dateDecrementDay = (date) => {
        date.setDate(date.getDate()-1);
    }
    const dateIncrementMonth = (date) => {
        date.setMonth(date.getMonth()+1, 1);
    }
    const dateDecrementMonth = (date) => {
        date.setMonth(date.getMonth()-1, 1);
    }
    const dateIsNextMonth = (year1, month1, year2, month2) => {
        if(month1 === 12) {
            let yearDiff = year2 - year1;
            if(yearDiff === 1 && month2 === 1) {
                return true;
            }
            return false;
        }
        let monthDiff = month2 - month1;
        if(year1 === year2 && monthDiff === 1) {
            return true;
        }
        return false;
    }
    const dateIsPreviousMonth = (year1, month1, year2, month2) => {
        if(month1 === 1) {
            let yearDiff = year2 - year1;
            if(yearDiff === -1 && month2 === 12) {
                return true;
            }
            return false;
        }
        let monthDiff = month2 - month1;
        if(year1 === year2 && monthDiff === -1) {
            return true;
        }
        return false;
    }
    export {
        dateIncrementDay,
        dateDecrementDay,
        dateIncrementMonth,
        dateDecrementMonth,
        dateIsNextMonth,
        dateIsPreviousMonth
    }
</script>

<script>
    import Day from './Day.svelte';
    import MediaQuery from './MediaQuery.svelte';
    import { createEventDispatcher } from 'svelte';

    export let month = 1;
    export let year = 1970;
    export let firstDayOrder = 1;
    export let value = 0;
    export let unixValue = false;

    const dispatch = createEventDispatcher();

    let days = [];
    let dayHeaders = [];
    // Ensure numbers;
    month = month - 0;
    year = year - 0;
    firstDayOrder = firstDayOrder - 0

    export let i18n = {
        monthsToDisplay: [
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
        ],
        weekdays: [
            "Sunday",
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday"
        ]
    };

    const currentDate = new Date(1970, 0, 1);
    const getDate = () => {
        return currentDate;
    }
    const setDate = (year, month, day=1) => {
        currentDate.setYear(year);
        currentDate.setMonth(month-1, day);
    }
    // Set on last day of month.
    setDate(year, month+1, 0);

    const dayClicked = (date) => {
        if(typeof date !== 'undefined') {
            if(unixValue) {
                value = date;
                dispatch('day-click', date);
            } else {
                value = Math.round(date.get / 1000);
                dispatch('day-click', date);
            }
        }
    }
    const fillDayHeaders = () => {
        let orderIndex = firstDayOrder;
        dayHeaders = [];
        for(let i=0; i<7; i++) {
            let weekDayIndex = (orderIndex + i) % 7;
            dayHeaders.push({
                index: orderIndex,
                name: i18n.weekdays[weekDayIndex]
            });
        }
        dayHeaders = [...dayHeaders];
    };
    const fillDays = () => {
        const numDays = getDate().getDate();
        let monthDays = [];
        // Get first date day index; 0 == Sunday.
        const firstMonthDay = new Date(year, getDate().getMonth(), 1);
        for(let i=1; i<=numDays; i++) {
            let dayDate = new Date(getDate().getFullYear(), getDate().getMonth(), i);
            let dayInactive = false;
            if(dayDate.getDay() === 0 || dayDate.getDay() === 6) {
                // Saturday or sunday
                dayInactive = true;
            }
            monthDays.push({
                day: dayDate.getDate(),
                month: dayDate.getMonth()+1,
                year: dayDate.getFullYear(),
                weekday: dayDate.getDay(),
                inactive: dayInactive,
                holiday: false
            });
        }
        let orderDiff = firstMonthDay.getDay() - firstDayOrder;
        if(orderDiff < 0) {
            orderDiff = orderDiff + 7;
        }
        for(let i=orderDiff; i>0; i--) {
            dateDecrementDay(firstMonthDay);
            monthDays = [{
                day: firstMonthDay.getDate(),
                month: firstMonthDay.getMonth()+1,
                year: firstMonthDay.getFullYear(),
                weekday: firstMonthDay.getDay(),
                inactive: true,
                holiday: false
            }, ...monthDays];
        }
        let nextMonthDiff = 7 - monthDays.length % 7;
        if(nextMonthDiff === 7) {
            nextMonthDiff = 0;
        }
        firstMonthDay.setFullYear(year);
        firstMonthDay.setMonth(getDate().getMonth(), 1);
        dateIncrementMonth(firstMonthDay);
        for(let i=0; i<nextMonthDiff; i++) {
            monthDays.push({
                day: firstMonthDay.getDate()+i,
                month: firstMonthDay.getMonth()+1,
                year: firstMonthDay.getFullYear(),
                weekday: firstMonthDay.getDay(),
                inactive: true,
                holiday: false
            });
        }
        days = monthDays;
    }
    fillDayHeaders();
    fillDays();
</script>

<style>
    .month {
        display: block;
    }
    .days {
        display: grid;
        /* grid-template-columns: auto auto auto auto auto auto auto; */
        grid-template-columns: 14.28% 14.28% 14.28% 14.28% 14.28% 14.28% 14.28%;
        grid-gap: 0px;
    }
    .day-header {
        box-sizing: border-box;
        display: block;
        position: relative;
        width: 100%;
        overflow: hidden;
    }
</style>

<div class="month">
    <div class="days">
        {#each dayHeaders as day}
        <MediaQuery query="(max-width: 720px)" let:matches>
            {#if matches}
            <div class="day-header" data-index={day.index}>{day.name.charAt(0)}</div>
            {:else}
            <div class="day-header" data-index={day.index}>{day.name}</div>
            {/if}
        </MediaQuery>
        {/each}
    </div>
    <div class="days">
        {#if days.length}
            {#each days as day}
            <Day
                day={day.day}
                month={day.month}
                year={day.year}
                weekday={day.weekday}
                inactive={day.inactive}
                holiday={day.holiday}
                unixValue={unixValue}
                on:day-click={(e) => dayClicked(e.detail)} />
            {/each}
        {/if}
    </div>
</div>
