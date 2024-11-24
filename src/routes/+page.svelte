<script lang="ts">
    import Camera from '$lib/components/Camera.svelte';
</script>

<svelte:head>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 24px;
            text-align: center;
            background-color: var(--background-color);
            color: var(--text-color);
            line-height: 1.6;
        }
    </style>
</svelte:head>

<Camera />
