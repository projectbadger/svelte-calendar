<script context="module">
    // import { 
    //     dateIsNextMonth,
    //     dateIsPreviousMonth
    // } from '../components/Month.svelte';
    let dateLeft;
    let dateActive;
    let dateRight;
    let months = [
        // {year: year, month: month, active: true, previous: false}
    ];
    const STATUS_LEFT = 0b00000100;
    const STATUS_ACTIVE = 0b00000010;
    const STATUS_RIGHT = 0b00000001;
    const getDateActive = () => {
        return dateActive;
    }
    const getDateLeft = () => {
        return dateLeft;
    }
    const getDateRight = () => {
        return dateRight;
    }
    const getMonths = () => {
        return months;
    }
    const setActive = (year, month) => {
        let index = -1;
        let leftIndex = -1;
        let rightIndex = -1;
        for(let i=0; i<months.length; i++) {
            months[i].status = 0;
            if(months[i].year == year && months[i].month == month) {
                months[i].status = STATUS_ACTIVE;
                index = i;
                dateActive = months[i];
            // } else if(dateIsNextMonth(year, month, months[i].year, months[i].month)) {
            //     months[i].status = STATUS_RIGHT;
            //     rightIndex = i;
            //     dateRight = months[i];
            // } else if(dateIsPreviousMonth(year, month, months[i].year, months[i].month)) {
            //     months[i].status = STATUS_LEFT;
            //     leftIndex = i;
            //     dateLeft = months[i];
            } else {
                months[i].status = 0;
            }
        }
        if(index < 0) {
            months.push({
                year: year,
                month: month,
                status: STATUS_ACTIVE,
            });
            dateActive = months[months.length-1];
            // return months[months.length-1];
        }
        months = months;
    }
    const navigateLeft = () => {
        let newYear = dateActive.year;
        let newMonth = dateActive.month - 1;
        if(newMonth < 1) {
            newYear = newYear - 1;
            newMonth = 12;
        }
        setActive(newYear, newMonth);
        // months = months;
    }
    const navigateRight = () => {
        let newYear = dateActive.year;
        let newMonth = dateActive.month + 1;
        if(newMonth > 12) {
            newYear = newYear + 1;
            newMonth = 1;
        }
        setActive(newYear, newMonth);
    }
    const monthIsGreater = (year1, month1, year2, month2) => {
        return year1*month1 > year2*month2;
    }
    // const getActiveMonths = () => {
    //     return [dateLeft, dateActive, dateRight];
    // }
    export {
        getDateActive,
    }
</script>

<script>
    import Month from '../components/Month.svelte';

    export let year = 1970;
    export let month = 1;
    export let firstDayOrder = 1;
    let navigation = STATUS_ACTIVE;
    let monthsArr = [];
    setActive(year, month);
    monthsArr = getMonths();
    // let activeMonths = getActiveMonths();
    const navLeft = () => {
        navigateLeft();
        monthsArr = getMonths();
        // activeMonths = getActiveMonths();
        // activeMonths = activeMonths;
        let navToggle = navigation&0b10000000;
        navigation = STATUS_LEFT|(navToggle^0b10000000);
        // let navToggle = navigation&0b10000000^0b10000000;
        console.log("New left, active, right", monthsArr, navigation);
    }
    const navRight = () => {
        navigateRight();
        // activeMonths = getActiveMonths();
        // activeMonths = activeMonths;
        monthsArr = [...getMonths()];
        let navToggle = navigation&0b10000000;
        navigation = STATUS_RIGHT|(navToggle^0b10000000);
        // navigation = STATUS_RIGHT^(0b10000000&STATUS_RIGHT);
        console.log("New left, active, right", monthsArr, navigation);
        navigation = navigation;
    }
</script>

<style>
    .description span {
        justify-content: center;
        align-items: center;
        padding-bottom: 10px;
        margin-bottom: 1rem;
    }
    .triangle {
        width: 0;
        height: 0;
        border-top: 0.4em solid transparent;
        border-bottom: 0.4em solid transparent;
        margin: 0.5rem;
        cursor: pointer;
    }
    .tr-left {
        border-right: 0.8em solid #555;
        float: left;
    }
    .tr-right {
        border-left: 0.8em solid #555;
        float: right;
    }

</style>

<div class="container">
    {#each monthsArr as aMonth}
    {#if aMonth.status&STATUS_ACTIVE}
    <div class="description">
        <h2>
            <span><div class="triangle tr-left"
                on:click="{()=>navLeft()}"></div></span>
            <span><b>Month {aMonth.month}</b></span>
            <span><div class="triangle tr-right"
                on:click="{()=>navRight()}"></div></span>
        </h2>
    </div>
    <div class="months">
        <div class="slider">
            <Month
                year="{aMonth.year}"
                month="{aMonth.month}"
                firstDayOrder="{firstDayOrder}"
                />
        </div>
    </div>
    {/if}
    {/each}
</div>