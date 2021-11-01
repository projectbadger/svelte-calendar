<script>
    export let events = [];
    export let year = 1970;
    export let month = 1;
    export let day = 1;

    let date = new Date(year, month, day);

</script>

<style>
    .arrow {
        border: solid black;
        border-width: 0 3px 3px 0;
        display: inline-block;
        padding-top: 3px;
        padding-bottom: 3px;
        bottom: 0;
        top: auto;
    }

    .description span {
        align-items: center;
        justify-content: center;
    }

    .right {
        float: right;
        transform: rotate(-45deg);
        -webkit-transform: rotate(-45deg);
    }

    .left {
        float: left;
        transform: rotate(135deg);
        -webkit-transform: rotate(135deg);
    }

    .h3m {
        margin-bottom: 0;
    }
</style>

<div>
    <div class="description">
        <span><i class="arrow left"></i></span>
        <span>{date.toValue()}</span>
        <span><i class="arrow right"></i></span>
    </div>
    <div class="events">
        {#each events as event}
        <div>
            <span>{event.name}</span>
        </div>
        {/each}
    </div>
</div>