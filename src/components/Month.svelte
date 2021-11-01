<script context="module">
    const currentDate = new Date(1970, 1, 1);
    const getDate = () => {
        return currentDate;
    }
    const setDate = (year, month, day=1) => {
        currentDate.setYear(year);
        currentDate.setMonth(month);
        currentDate.setDate(day);
    }
    const dateIncrementDay = (date) => {
        if(date.getDay() == new Date(date.getFullYear(), date.getMonth(), 0)) {
            // Last month date.
            if(date.getMonth() == 12) {
                date.setYear(date.getFullYear()+1);
                date.setMonth(1);
                date.setDay(1);
            } else {
                date = new Date(date.getFullYear(), date.getMonth()+1, 1);
            }
        } else {
            date.setDate(date.getDay()+1);
        }
    }
    const dateDecrementDay = (date) => {
        if(date.getDay() == 1) {
            if(date.getMonth() == 1) {
                date.setYear(date.getFullYear()-1);
                date.setMonth(12);
                date.setDay(31);
            } else {
                date.setMonth(date.getMonth()-1);
                date.setDate(0);
            }
        } else {
            date.setDate(date.getDate()-1);
        }
    }
    const dateIncrementMonth = (date) => {
        if(date.getMonth() === 12) {
            date.setYear(date.getFullYear() + 1);
            date.setMonth(1);
        } else {
            date.setMonth(date.getMonth() + 1);
        }
    }
    const dateDecrementMonth = (date) => {
        if(date.getMonth() == 1) {
            date.setYear(date.getFullYear()-1);
            date.setMonth(12);
            // date.setDay(31);
        } else {
            date.setMonth(date.getMonth()-1);
            // date.setDate(0);
        }
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
        getDate,
        setDate,
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

    export let month = 1;
    export let year = 1970;
    // export let events = [];
    export let firstDayOrder = 1;

    let days = [];
    // Insure numbers;
    month = month - 0;
    year = year - 0;
    firstDayOrder = firstDayOrder - 0

    const weekday = new Array(7);
    weekday[0] = "Sunday";
    weekday[1] = "Monday";
    weekday[2] = "Tuesday";
    weekday[3] = "Wednesday";
    weekday[4] = "Thursday";
    weekday[5] = "Friday";
    weekday[6] = "Saturday";

    // Set on last day of month.
    // date = new Date(year, month, 0);
    setDate(year, month, 0);
    const fillDays = () => {
        const numDays = getDate().getDate();
        let monthDays = [];
        // Get first date day index; 0 == Sunday.
        const firstMonthDay = new Date(year, getDate().getMonth(), 1);
        for(let i=1; i<=numDays; i++) {
            let dayDate = new Date(getDate().getFullYear(), getDate().getMonth(), i);
            monthDays.push({
                day: dayDate.getDate(),
                month: dayDate.getMonth(),
                year: dayDate.getFullYear(),
                weekday: dayDate.getDay(),
                inactive: false,
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
                month: firstMonthDay.getMonth(),
                year: firstMonthDay.getFullYear(),
                weekday: firstMonthDay.getDay(),
                inactive: true,
                holiday: false
            }, ...monthDays];
        }
        days = monthDays;
    }
    fillDays();
</script>

<style>
    .month {
        display: block;
    }
    .days {
        display: grid;
        grid-template-columns: auto auto auto auto auto auto auto;
        grid-gap: 0px;
    }
</style>

<div class="month">
    <div class="description">

    </div>
    <div class="days">
        {#if days.length}
            {#each days as day}
            <Day
                day="{day.day}"
                month="{day.month}"
                year="{day.year}"
                weekday="{day.weekday}"
                inactive="{day.inactive}"
                holiday="{day.holiday}" />
            {/each}
        {/if}
    </div>
</div>
