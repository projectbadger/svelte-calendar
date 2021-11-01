<script>
    import MonthView from './MonthView.svelte';
    import DayView from './DayView.svelte';
    export let year = 1970;
    export let month = 1;
    export let day = 1;
    export let view = 0b00000010;
    const setYearView = () => {
        view = 0b00000001;
    }
    const setMonthView = () => {
        view = 0b00000010;
    }
    const setDayView = () => {
        view = 0b00000100;
    }
    const setEventView = () => {
        view = 0b00000001;
    }
</script>