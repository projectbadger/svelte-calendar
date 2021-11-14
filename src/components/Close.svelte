<script>
    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();
    const setEvent = () => {
        console.log("close clicked");
        dispatch('click');
    }
</script>

<style>
    .action {
        display: inline-block;
        position: relative;
        cursor: pointer;
        margin: 1rem;
        font-size: 5rem;
        padding: 0;
        width: 3rem;
        height: 3rem;
    }
    .close {
        float: center;
    }
    .close:before, .close:after {
        position: absolute;
        /* left: 2.5rem; */
        content: " ";
        height: 100%;
        width: 0.5rem;
        background-color: black;
    }
    .close:before {
        transform: translateX(-50%) rotate(45deg);
    }
    .close:after{
        transform: translateX(-50%) rotate(-45deg);
        /* display: inline-block;
        content: "\00d7"; */
    }
</style>

<span class="action close" on:click={() => setEvent()}></span>
