<script>
    // Imports
    import { Lightbox } from "svelte-lightbox";
    import ShowcaseLaptop from "./GameShowcaseLaptop.svelte";
    import ShowcasePhone from "./GameShowcasePhone.svelte";

    // Vars
    export let title, desc, platform, images, src, gif, date;
    export let hasDesktopPreview, hasMobilePreview;
    export let icon = '';
    export let links = [];
    export let videos = [];
    export let fullPage = false;
</script>

<!-- On mobile, hide preview object, only show links (play in browser) for mobile, for desktop games, show gif in laptop -->
<!-- For landscape, adjust spotlight flex and make page bigger (vw height) -->

<!-- allow user to click images for full size module popup -->
<!-- Add gallery support -->
<!-- Make open as page button scroll to top page -->

<div class="content">
    <!-- Showcase Type -->
    {#if platform === "phone"}
        <ShowcasePhone
            {src}
            {title}
            {links}
            {desc}
            {date}
            {gif}
            {icon}
            {hasDesktopPreview}
            {hasMobilePreview}
        />
    {:else if platform === "laptop"}
        <ShowcaseLaptop
            {src}
            {title}
            {links}
            {desc}
            {date}
            {gif}
            {hasDesktopPreview}
            {hasMobilePreview}
        />
    {/if}

    <!-- Media -->
    <div class="content__section content__padding images">
        {#each videos as video}
            <div class="image">
                <iframe
                    class="video"
                    src={video.src}
                    title="YouTube video player"
                    frameborder="0"
                    allow="autoplay; clipboard-write; encrypted-media;picture-in-picture"
                    allowfullscreen
                />
            </div>
        {/each}
        {#each images as image}
            <div class="image">
                <Lightbox transitionDuration="150">
                    <img src={image.src} alt={image.alt} />
                </Lightbox>
            </div>
        {/each}
    </div>

    <!-- Full Page Button -->
    {#if !fullPage}
        <a
            href={`/games/${title.split(" ").join("").toLowerCase()}`}
            target="new"
        >
            <button class="button">Open as page</button>
        </a>
    {/if}
</div>

<style>
    img {
        max-width: 100%;
    }

    .images {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: center;
    }

    .image {
        flex: 1;
        min-width: max(270px, 40%);
        margin: 10px;
        display: flex;
        justify-content: center;
    }

    .video {
        width: 1193px;
        aspect-ratio: 16/9;
    }
</style>
