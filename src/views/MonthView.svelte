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
        month = parseInt(month);
        for(let i=0; i<months.length; i++) {
            months[i].status = 0;
            if(months[i].year == year && months[i].month == month) {
                months[i].status = STATUS_ACTIVE;
                index = i;
                dateActive = months[i];
            } else {
                months[i].status = 0;
            }
        }
        if(index < 0) {
            dateActive = {
                year: year,
                month: month,
                status: STATUS_ACTIVE,
            };
            months.push(dateActive);
            // return months[months.length-1];
        }
        months = [...months];
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
    import Select from '../components/Select.svelte';
    import SelectNumber from '../components/SelectNumber.svelte';
    import YearSelect from '../components/YearSelect.svelte'
    import { createEventDispatcher } from 'svelte';

    export let year = 0;
    export let month = 0;
    if(year === 0 || month === 0) {
        let currentDate = new Date();
        if(year === 0) {
            year = currentDate.getFullYear();
        }
        if(month === 0) {
            month = currentDate.getMonth()+1;
        }
    }
    export let firstDayOrder = 1;
    export let value = 0;
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
    export let unixValue = false;
    const dispatch = createEventDispatcher();
    let navigation = STATUS_ACTIVE;
    let monthsArr = [];
    let yearSelectActive = false;
    setActive(year, month);
    monthsArr = getMonths();
    const navLeft = () => {
        navigateLeft();
        monthsArr = [...getMonths()];
        let navToggle = navigation&0b10000000;
        navigation = STATUS_LEFT|(navToggle^0b10000000);
    }
    const navRight = () => {
        navigateRight();
        monthsArr = [...getMonths()];
        let navToggle = navigation&0b10000000;
        navigation = STATUS_RIGHT|(navToggle^0b10000000);
        navigation = navigation;
    }
    const monthChange = (e) => {
        let m = parseInt(e.detail);
        let activeDate = getDateActive();
        let y = activeDate.year;
        if(m === 0) {
            m = activeDate.month;
        }
        setActive(y, m);
        monthsArr = [...getMonths()];
    }
    const yearChange = (event) => {
        if(event) {
            let y = parseInt(event.detail);
            let activeDate = getDateActive();
            let m = activeDate.month;
            if(y === 0) {
                y = activeDate.year;
            }
            setActive(y, m);
        }
        monthsArr = [...getMonths()];
    }
    const setYearSelect = (active, event) => {
        yearSelectActive = active;
        if(event) {
            let y = event.detail.year;
            let activeDate = getDateActive();
            let m = activeDate.month;
            if(y === 0) {
                y = activeDate.year;
            }
            setActive(y, m);
        }
        monthsArr = [...getMonths()];
    }
    const dayClicked = (e) => {
        dispatch("day-click", e.detail);
    }
</script>

<style>
    .description {
        width: 100%;
        margin: 0;
        display: grid;
        grid-template-columns: auto auto auto auto;
        grid-gap: 0px;
    }
    .description span {
        justify-content: center;
        align-items: center;
    }
    .months {
        margin: 0;
    }
    .triangle {
        width: 0;
        height: 0;
        border-top: 0.4em solid transparent;
        border-bottom: 0.4em solid transparent;
        margin-top: 0.8rem;
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
    .selector {
        display: inline-block;
        text-align: center;
        justify-content: center;
        cursor: pointer;
        padding: 0.5rem;
        margin: 0;
    }
    .selector:hover {
        background-color: var(--clr-bg-h);
    }
</style>

<div class="container">
    {#each monthsArr as aMonth}
    {#if aMonth.status&STATUS_ACTIVE&&yearSelectActive}
    <YearSelect
        year={aMonth.year}
        on:close={(e) => setYearSelect(false, e)} />
    {:else if aMonth.status&STATUS_ACTIVE}
    <div class="description">
        <span><div class="triangle tr-left"
            on:click="{()=>navLeft()}"></div></span>
        <span><Select value={aMonth.month} on:change={(e) => monthChange(e)}>
            {#each monthsToDisplay as monthOption, index}
            <option value={index+1}>{monthOption}</option>
            {/each}
        </Select></span>
        <span><SelectNumber value={aMonth.year} on:change={(e) => yearChange(e)} /></span>
        <!-- <span class="selector" on:click={() => setYearSelect(true, false)}><b>{aMonth.year}</b></span> -->
        <span><div class="triangle tr-right"
            on:click="{()=>navRight()}"></div></span>
    </div>
    <div class="months">
        <div class="slider">
            <Month
                year={aMonth.year}
                month={aMonth.month}
                firstDayOrder={firstDayOrder}
                unixValue={unixValue}
                bind:value={value}
                on:day-click={(e)=>dayClicked(e)} />
        </div>
    </div>
    {/if}
    {/each}
</div>