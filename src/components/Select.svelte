<script>
    import { createEventDispatcher, onMount } from 'svelte';
    export let value = 0;
    let selectedText = "";
    let selectedIndex = -1;
    export let classes = {
        selectBackgroundColor: "#fff",
        selectItemsBackgroundColor: "#fff",
        selectSelectedBackgroundColor: "#aaa"
    };
    export let selectedBold = true;
    let container;
    let selectElement;
    let selectedElement;
    let selectItems;
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
        console.log(e)
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
        // console.log("This, selectedElement", this, selectedElement);
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
        // console.log("Value:", selectElement.value)
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
            console.log("Selected option not found, setting the first one", value);
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
        // console.log("Select element:", selectElement);
        if(selectElement.selectedIndex < 0) {
            selectElement.selectedIndex = 0;
        }
        // selectedIndex = selectElement.selectIndex;
        selectedElement.innerHTML, selectedText = selectElement.options[selectElement.selectedIndex].innerHTML;

        setOptionsArray();
        console.log("Select Value:", value)
    });
    // document.addEventListener("click", closeAllSelect);
</script>

<style>
    .select-container {
        position: relative;
    }
    .select-container select {
        display: none;
    }
    .selected-div {
        background-color: grey;
    }
    .selected-div:after {
        position: absolute;
        content: "";
        top: 14px;
        right: 10px;
        width: 0;
        height: 0;
        border: 6px solid transparent;
        /* border-color: #aaa transparent transparent transparent; */
    }
    .select-selected .select-arrow-active:after {
        border-color: transparent transparent #aaa transparent;
        top: 7px;
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
        background-color: DodgerBlue;
        top: 100%;
        left: 0;
        right: 0;
        z-index: 99;
    }

    .select-items div:hover, .same-as-selected {
        background-color: rgba(0, 0, 0, 0.1);
    }
</style>

<div class="select-container"
    style="background-color:{classes.selectBackgroundColor}"
    bind:this={container}>
    <select bind:value={value} bind:this={selectElement} style="display:none">
        <slot />
    </select>
    <div class="select-selected"
        style="background-color:{classes.selectBackgroundColor};{showOptions ? "visibility:hidden;" : ""}"
        bind:this={selectedElement}
        on:click|preventDefault={(e) => selectClick(e)}>
        {selectedOption.text}
    </div>
    {#if showOptions}
    <div class="select-items"
        style="background-color:{classes.selectItemsBackgroundColor}"
        bind:this={selectItems}>
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