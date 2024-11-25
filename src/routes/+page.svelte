<script lang="ts">
    import Camera from '$lib/components/Camera.svelte';
    import Consent from '$lib/components/Consent.svelte';
    import { cameraConsent } from '$lib/stores/consentStore';
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


        button {
            background-color: var(--primary-color);
            color: white;
            border: none;
            padding: 14px 28px;
            border-radius: 12px;
            cursor: pointer;
            margin: 12px;
            font-size: 1rem;
            font-weight: 600;
            transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
            letter-spacing: 0.025em;
        }

        button:hover:not(:disabled) {
            background-color: var(--primary-hover);
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(99, 102, 241, 0.3);
        }

        button:active:not(:disabled) {
            transform: translateY(0);
        }

        button:disabled {
            background-color: #CBD5E1;
            cursor: not-allowed;
            box-shadow: none;
        }
        
        h1 {
            font-size: 2.5rem;
            margin-bottom: 0.75rem;
            color: var(--primary-color);
            letter-spacing: -0.025em;
        }
    </style>
</svelte:head>

{#if $cameraConsent}
    <Camera />
{:else}
    <Consent />
{/if}
