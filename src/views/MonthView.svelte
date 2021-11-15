<script>
    import Month from '../components/Month.svelte';
    import Select from '../components/Select.svelte';
    import SelectNumber from '../components/SelectNumber.svelte';
    import { createEventDispatcher } from 'svelte';

    const STATUS_LEFT = 0b00000100;
    const STATUS_ACTIVE = 0b00000010;
    const STATUS_RIGHT = 0b00000001;
    const dispatch = createEventDispatcher();

    export let year = 0;
    export let month = 0;
    export let firstDayOrder = 1;
    export let value = 0;
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
    export let unixValue = false;

    if(year === 0 || month === 0) {
        let currentDate = new Date();
        if(year === 0) {
            year = currentDate.getFullYear();
        }
        if(month === 0) {
            month = currentDate.getMonth()+1;
        }
    }

    let navigation = STATUS_ACTIVE;

    let monthsArr = [];
    let dateActive;
    const setActive = (year, month) => {
        let index = -1;
        month = parseInt(month);
        for(let i=0; i<monthsArr.length; i++) {
            monthsArr[i].status = 0;
            if(monthsArr[i].year == year && monthsArr[i].month == month) {
                monthsArr[i].status = STATUS_ACTIVE;
                index = i;
                dateActive = monthsArr[i];
            } else {
                monthsArr[i].status = 0;
            }
        }
        if(index < 0) {
            dateActive = {
                year: year,
                month: month,
                status: STATUS_ACTIVE,
            };
            monthsArr.push(dateActive);
        }
        monthsArr = [...monthsArr];
    }
    setActive(year, month);

    const navLeft = () => {
        let newYear = dateActive.year;
        let newMonth = dateActive.month - 1;
        if(newMonth < 1) {
            newYear = newYear - 1;
            newMonth = 12;
        }
        setActive(newYear, newMonth);
        let navToggle = navigation&0b10000000;
        navigation = STATUS_LEFT|(navToggle^0b10000000);
    }

    const navRight = () => {
        let newYear = dateActive.year;
        let newMonth = dateActive.month + 1;
        if(newMonth > 12) {
            newYear = newYear + 1;
            newMonth = 1;
        }
        setActive(newYear, newMonth);
        let navToggle = navigation&0b10000000;
        navigation = STATUS_RIGHT|(navToggle^0b10000000);
        navigation = navigation;
    }

    const monthChange = (e) => {
        let m = parseInt(e.detail);
        let y = dateActive.year;
        if(m === 0) {
            m = dateActive.month;
        }
        setActive(y, m);
        monthsArr = [...monthsArr];
    }

    const yearChange = (event) => {
        if(event) {
            let y = parseInt(event.detail);
            let m = dateActive.month;
            if(y === 0) {
                y = dateActive.year;
            }
            setActive(y, m);
        }
        monthsArr = [...monthsArr];
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
</style>

<div class="container">
    {#each monthsArr as aMonth}
    {#if aMonth.status&STATUS_ACTIVE}
    <div class="description">
        <span><div class="triangle tr-left"
            on:click="{()=>navLeft()}"></div></span>
        <span><Select value={aMonth.month} on:change={(e) => monthChange(e)}>
            {#each i18n.monthsToDisplay as monthOption, index}
            <option value={index+1}>{monthOption}</option>
            {/each}
        </Select></span>
        <span><SelectNumber value={aMonth.year} on:change={(e) => yearChange(e)} /></span>
        <span><div class="triangle tr-right"
            on:click="{()=>navRight()}"></div></span>
    </div>
    <div class="months">
        <div class="day-headers">
            
        </div>
        <div>
            <Month
                year={aMonth.year}
                month={aMonth.month}
                firstDayOrder={firstDayOrder}
                unixValue={unixValue}
                i18n={i18n}
                bind:value={value}
                on:day-click={(e)=>dayClicked(e)} />
        </div>
    </div>
    {/if}
    {/each}
</div>