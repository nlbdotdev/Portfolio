<script>
    import DeviceContent from "./DeviceContent.svelte";

    export let img = "";
    export let src = "";
    export let gif = "";
    export let hasDesktopPreview = true;
    export let hasMobilePreview = true;
</script>

<div class="laptop">
    <div class="laptop__top">
        <div class="laptop__camera" />
    </div>
    <div class="laptop__mid">
        <div class="game">
            <DeviceContent
                {img}
                {src}
                {gif}
                {hasDesktopPreview}
                {hasMobilePreview}
            />
        </div>
    </div>
    <div class="laptop__bot">
        <div class="laptop__divot" />
    </div>
</div>

<style>
    /* Laptop */
    .laptop {
        width: 95%;
        aspect-ratio: 3/2;
        background-color: rgb(1, 16, 11);
        border-radius: 15px;
        display: flex;
        flex-direction: column;
        box-shadow: 3px 0px 12px rgb(82, 82, 82);
        align-items: center;
        margin: auto;
    }

    .laptop__top {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .laptop__camera {
        height: 40%;
        aspect-ratio: 1/1;
        border: rgb(40, 39, 39) 2px solid;
        border-radius: 50px;
    }

    .laptop__mid {
        width: 95%;
        /* flex: 1; */
        height: 90%;
        margin: auto;
        overflow: hidden;
    }

    .laptop__bot {
        flex: 1.5;
        display: flex;
        justify-content: center;
        width: 105%;
        background-color: black;
        border-radius: 15px 15px 100px 100px;
        box-shadow: 3px 5px 12px rgb(82, 82, 82);
    }

    .laptop__divot {
        background-color: rgb(40, 39, 39);
        width: 40%;
        height: 30%;
        border-radius: 0px 0px 30px 30px;
    }

    /* Preview */
    .game {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
    }
</style>
