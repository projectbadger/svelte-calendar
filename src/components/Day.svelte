<script>
    export let day = 1;
    export let month = 1;
    export let year = 1970;
    export let weekday = "";
    export let inactive = false;
    export let holiday = false;
    export let events = [];

    const date = new Date(year, month, day);
</script>

<style>
    .day {
        /* width: 5rem;
        height: 5rem; */
        display: block;
        position: relative;
        width: 100%;
        border: 1px solid black;
        border-radius: 5px;
        overflow: hidden;
        cursor: pointer;
    }
    .day:after {
        content: "";
        display: block;
        padding-bottom: 100%;
    }
    .day:hover, .day:focus {
        background-color: rgb(227, 241, 250);
    }
    .day > div {
        display: flex;
        flex-direction: column;
        position: absolute;
        width: 100%;
        height: 100%;
        left: 0;
        top: 0;
    }
    .inactive {
        background-color: rgb(133, 151, 161);
    }
    .description {
        /* width: 100%; */
        margin-bottom: 0.5rem;
    }
    .events {
        display: block;
        /* width: 100%; */
        /* height: 100%; */
        flex-direction: column-reverse;
        /* border: 1px solid black; */
    }
    .events ul, .events li {
        margin: 0;
        padding: 0;
    }
    .events > ul {
        list-style: none;
        text-align: middle;
    }
    .event {
        border-radius: 5px;
        cursor: pointer;
    }
    .event:hover {
        background-color: rgb(185, 209, 224);
    }
</style>

<div class="day {inactive?"inactive":""} {holiday?"holiday":""}"
    data-day="{day}"
    data-month="{month}"
    data-year="{year}">
    <div>
        <div class="description">
            <span>{day}.</span>
            {#if weekday}
            <!-- <span>{weekday}</span> -->
            {/if}
            <!-- <span>{date.getDay()}</span> -->
        </div>
        <div class="events">
            {#if events.length}
            <ul>
                {#each events as event}
                <li>
                    <div class="event">
                        {event.name}
                    </div>
                </li>
            {/each}
            </ul>
            {/if}
        </div>
    </div>
</div>
