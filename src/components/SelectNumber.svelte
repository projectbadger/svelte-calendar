<script>
    import { createEventDispatcher } from 'svelte';
    
    export let value = 2000;

    const dispatch = createEventDispatcher();

    let showOptions = false;
    const incrementValue = () => {
        value = value + 1;
        emitChange();
    }
    const decrementValue = () => {
        value = value - 1;
        emitChange();
    }
    const emitChange = (e) => {
        dispatch("change", value);
        showOptions = true;
    }

    const showAllSelect = (e) => {
        e.stopPropagation();
        setCloseListener(true);
        showOptions = true;
    }
    const closeAllSelect = (e) => {
        e.stopPropagation();
        if(e.target.classList.contains("tr-inc-dec-trigger")) {
            return;
        }
        showOptions = false;
        setCloseListener(false);
    };
    const setCloseListener = (active = true) => {
        if(active) {
            document.addEventListener("click", closeAllSelect);
        } else {
            document.removeEventListener("click", closeAllSelect);
        }
    }
</script>

<style>
    .select-number-container {
        position: relative;
        display: inline-block;
        text-align: center;
        max-width: 100%;
        min-width: 100%;
        height: 100%;
        padding: 0;
    }
    /* Style items (options): */
    .increment, .decrement {
        background-color: var(--clr-bg);
        position: absolute;
        z-index: 99;
    }
    .increment {
        /* top: 100%; */
        bottom: 100%;
        /* left: 40%;
        right: 40%; */
        left: 0;
        right: 0;
        /* transform: translateY(-200%); */
    }
    .decrement {
        top: 100%;
        /* left: 45%;
        right: 45%; */
        left: 0;
        right: 0;
    }
    .decrement:hover, .increment:hover {
        background-color: var(--clr-bg-h);
    }
    .increment span, .decrement span {
        position: relative;
        cursor: pointer;
        height: inherit;
        /* margin: 0; */
        /* padding: 0; */
    }
    .selected {
        height: 100%;
        margin: 0;
        /* padding-top: 0.5rem; */
        padding: 0;
        overflow: hidden;
        cursor: pointer;
    }
    .selected p {
        margin: auto;
        padding: 0;
        margin-top: 0.5rem;
    }
    .number { 
        text-decoration: none;
        box-sizing: border-box;
        -moz-appearance: textfield;
        appearance: textfield;
        margin: 0;
        /* margin-top: 0.5rem; */
        padding: 0;
        width: 100%;
        height: 100%;
        border: none;
        border-radius: 0%;
        text-align: center;
    }
    .number:focus, .number:target, .number:hover {
        border: none;
        background-color:var(--clr-bg-h);
    }
    .number::-webkit-inner-spin-button, 
    .number::-webkit-outer-spin-button { 
        -webkit-appearance: none; 
        margin: 0;
        padding: 0;
        border: none;
    }
    .selected:hover, .selected:focus {
        background-color: var(--clr-bg-h);
    }
    .triangle {
        display: inline-block;
        width: 0;
        height: 0;
        border-left: 0.4em solid transparent;
        border-right: 0.4em solid transparent;
        /* margin-top: 0.8rem; */
    }
    .tr-up {
        border-bottom: 0.8em solid #555;
    }
    .tr-down {
        border-top: 0.8em solid #555;
    }
    .tr-inc-dec-trigger {
        cursor: pointer;
    }
    /* .arrow-up, .arrow-down {
        border: solid black;
        border-width: 0 0.5rem 0.5rem 0;
        display: inline-block;
        padding: 3px;
    }
    .arrow-up {
        transform: rotate(-135deg);
        -webkit-transform: rotate(-135deg);
    }

    .arrow-down {
        transform: rotate(45deg);
        -webkit-transform: rotate(45deg);
    } */
</style>

<div class="select-number-container">
    {#if showOptions}
    <div
        class='increment tr-inc-dec-trigger'
        style="{!showOptions ? "visibility:hidden;" : ""}"
        on:click|preventDefault={() => incrementValue()}>
        <span class="triangle tr-up tr-inc-dec-trigger"></span>
    </div>
    {/if}
    <div class="selected"
        on:click|preventDefault={(e) => showAllSelect(e)}>
        {#if showOptions}
        <input class="number" type="number"
            bind:value={value}
            on:change|preventDefault={(e)=>emitChange(e)}>
        {:else}
        <p>{value}</p>
        {/if}
    </div>
    {#if showOptions}
    <div
        class='decrement tr-inc-dec-trigger'
        style="{!showOptions ? "visibility:hidden;" : ""}"
        on:click|preventDefault={() => decrementValue()}>
        <span class="triangle tr-down tr-inc-dec-trigger"></span>
    </div>
    {/if}
</div>