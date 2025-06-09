<script lang="ts">
    import Camera from '$lib/components/Camera.svelte';
    import Consent from '$lib/components/Consent.svelte';
    import ScenarioManager from '$lib/components/ScenarioManager.svelte';
    import { getCameraConsent } from '$lib/stores/consentStore';
    import { getScenarioStores } from '$lib/stores/scenarioStore';

    const cameraConsent = getCameraConsent();
    const { scenarios, selectedScenarioId } = getScenarioStores();

    let showScenarioManager = false;
</script>

<svelte:head>
    <style>
        button {
            background-color: var(--primary-color);
            color: white;
            border: none;
            padding: 7px 14px;
            border-radius: 12px;
            cursor: pointer;
            margin: 6px;
            font-size: 1rem;
            font-weight: 600;
            transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
            letter-spacing: 0.025em;
            /* Improved contrast for accessibility */
            background-color: #4338ca;
        }

        button:hover:not(:disabled) {
            background-color: #3730a3;
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(99, 102, 241, 0.3);
        }

        button:active:not(:disabled) {
            transform: translateY(0);
        }

        button:disabled {
            background-color: #94a3b8;
            color: #64748b;
            cursor: not-allowed;
            box-shadow: none;
        }

        h1 {
            font-size: 2.5rem;
            margin-bottom: 0.75rem;
            color: var(--primary-color);
            letter-spacing: -0.025em;
        }

        .header {
            align-items: center;
            position: relative;
            background-color: rgba(200, 200, 200, 0.5);
            border-radius: 15px;
            height: 64px;
        }

        .header-image-left {
            position: absolute;
            left: 0;
        }

        .header-image-right {
            position: absolute;
            right: 0;
        }
        .header-image img {
            border-radius: 12px;
            height: 64px;
            width: 64px;
        }

        .scenario-selection {
            margin-bottom: 0;
            display: flex;
            gap: 1rem;
            justify-content: center;
            align-items: center;
        }

        .scenario-selection select {
            padding: 0.5rem;
            border: 1px solid var(--border-color);
            border-radius: 4px;
            background-color: #4338ca;
            min-width: 200px;
            color: white;
        }

    </style>
</svelte:head>

<header class="header">
    <div class="header-image header-image-left">
        <img src="/favicon_dall-e.png" alt="Third Eye logo" width="64" height="64" />
    </div>
    <div class="header-image header-image-right">
        <img src="/favicon_dall-e.png" alt="Third Eye logo" width="64" height="64" />
    </div>
    <h1>Third Eye</h1>
</header>

{#if !$cameraConsent}
    <Consent />
{:else if showScenarioManager}
    <ScenarioManager close={() => showScenarioManager = false} />
{:else}

    <div class="scenario-selection">
        <select id="scenario-select" bind:value={$selectedScenarioId}>
            {#each $scenarios as scenario}
                <option value={scenario.id}>{scenario.name}</option>
            {/each}
        </select>
        <button onclick={() => showScenarioManager = true}>Manage Scenarios</button>
    </div>
    <Camera instructions={$scenarios.find(s => s.id === $selectedScenarioId)?.instructions || ''} />
{/if}
