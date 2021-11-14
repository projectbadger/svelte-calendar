<script>
    import { createEventDispatcher, onMount } from 'svelte';
    export let value = 0;
    let selectedText = "";
    let selectedIndex = -1;
    let container;
    let selectElement;
    let selectedElement;
    let selectedOption = {
        text: " ",
        index: -1,
        value: 0,
        selected: true
    };
    let optionsArr = [];
    const dispatch = createEventDispatcher();

    let showOptions = false;

    const showAllSelect = () => {
        showOptions = true;
    }
    const closeAllSelect = (e) => {
        e.stopPropagation();
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

    const selectClick = (e) => {
        e.stopPropagation();
        showOptions = showOptions^true;
        selectedElement.classList.toggle("select-arrow-active");
        setCloseListener(true);
    }

    const optionSelect = (e, {text, value, index}) => {
        e.stopPropagation();
        selectedElement.innerHTML, selectedText = text;
        selectedElement.dataset.value = value;
        selectedElement.dataset.index = index;
        selectElement.selectedIndex = index;
        setSelectedOption(value);
        closeAllSelect(e);
        dispatch("change", value);
    }

    const setSelectedOption = (value) => {
        let foundSelected = false;
        for(let i=0; i<optionsArr.length; i++) {
            if(optionsArr[i].value == value) {
                optionsArr[i].selected = true;
                selectedOption = optionsArr[i];
                foundSelected = true;
            } else {
                optionsArr[i].selected = false;
            }
        }
        if(!foundSelected && optionsArr.length > 0) {
            selectedOption = optionsArr[0];
        }
        optionsArr = optionsArr;
    }

    const setOptionsArray = () => {
        let selectElementLength = selectElement.length;
        optionsArr = [];
        for(let i=0; i<selectElementLength; i++) {
            let optionElementValue = selectElement.options[i].value;
            let selected = false;
            if(optionElementValue === value) {
                selected = true;
            }
            let optionElementText = selectElement.options[i].innerHTML;
            optionsArr = [...optionsArr, {
                text: optionElementText,
                value: optionElementValue,
                index: i,
                selected
            }];
        }
        setSelectedOption(value)
    }

    onMount(() => {
        if(selectElement.selectedIndex < 0) {
            selectElement.selectedIndex = 0;
        }
        setOptionsArray();
    });
</script>

<style>
    .select-container {
        position: relative;
    }
    .select-container select {
        display: none;
    }
    /* style the items (options), including the selected item: */
    .select-items div,.select-selected {
        /* color: #aaa; */
        padding: 8px 16px;
        /* border: 1px solid transparent; */
        border-color: transparent transparent rgba(0, 0, 0, 0.1) transparent;
        cursor: pointer;
    }
    /* Style items (options): */
    .select-items {
        position: absolute;
        display: flex;
        flex-direction: column;
        /* background-color: DodgerBlue; */
        background-color: var(--clr-bg);
        top: 100%;
        left: 0;
        right: 0;
        z-index: 99;
    }
    .select-selected:hover, .select-selected:focus {
        background-color: var(--clr-bg-h);
    }
    .select-items div:hover, .same-as-selected {
        /* background-color: rgba(0, 0, 0, 0.1); */
        background-color: var(--clr-bg-h);
    }
</style>

<div class="select-container" bind:this={container}>
    <select bind:value={value} bind:this={selectElement} style="display:none">
        <slot />
    </select>
    <div class="select-selected"
        style="{showOptions ? "visibility:hidden;" : ""}"
        bind:this={selectedElement}
        on:click|preventDefault={(e) => selectClick(e)}>
        {selectedOption.text}
    </div>
    {#if showOptions}
    <div class="select-items">
        {#each optionsArr as option}
        <div
            data-value={option.value}
            data-index={option.index}
            class='{option.index === selectedElement.dataset.index ? "same-as-selected selected": ""}'
            on:click|preventDefault={(e) => optionSelect(e, option)}>
            {option.text}
        </div>
        {/each}
    </div>
    {/if}
</div>