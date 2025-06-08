<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import type { AnalysisEntry } from '$lib/stores/analysisHistoryStore';

    export let show = false;
    export let historyEntries: AnalysisEntry[] = [];

    let dialog: HTMLDialogElement;
    let selectedEntryTimestamps: Set<number> = new Set();
    const dispatch = createEventDispatcher();

    $: if (dialog) {
        if (show && !dialog.open) {
            // Reset selection when opening and auto-select latest two entries
            selectedEntryTimestamps = new Set();
            // Auto-select the latest two entries (first two in the array since they're ordered by timestamp descending)
            if (historyEntries.length >= 2) {
                selectedEntryTimestamps.add(historyEntries[0].timestamp);
                selectedEntryTimestamps.add(historyEntries[1].timestamp);
            }
            dialog.showModal();
        } else if (!show && dialog.open) {
            dialog.close();
        }
    }

    function toggleSelection(timestamp: number) {
        if (selectedEntryTimestamps.has(timestamp)) {
            selectedEntryTimestamps.delete(timestamp);
        } else {
            selectedEntryTimestamps.add(timestamp);
        }
        selectedEntryTimestamps = selectedEntryTimestamps; // Trigger Svelte reactivity
    }

    function handleConfirm() {
        const selectedEntries = historyEntries.filter(entry =>
            selectedEntryTimestamps.has(entry.timestamp)
        );
        dispatch('confirm', selectedEntries);
        dialog.close();
    }

    function handleCancel() {
        dispatch('cancel');
        dialog.close();
    }
</script>

<dialog
    bind:this={dialog}
    class="modal-content"
    aria-labelledby="compare-dialog-title"
    aria-describedby="compare-dialog-message"
>
    <h2 id="compare-dialog-title">Select Items to Compare</h2>
    <p id="compare-dialog-message">Choose at least two entries to compare.</p>

    <div class="entries-grid">
        {#each historyEntries as entry (entry.timestamp)}
            <label class="entry-card" class:selected={selectedEntryTimestamps.has(entry.timestamp)}>
                <input
                    type="checkbox"
                    on:change={() => toggleSelection(entry.timestamp)}
                    checked={selectedEntryTimestamps.has(entry.timestamp)}
                />
                <img src={Array.isArray(entry.imageData) ? entry.imageData[0] : entry.imageData} alt="Analysis {new Date(entry.timestamp).toLocaleDateString()}" />
                <span class="timestamp-label">{new Date(entry.timestamp).toLocaleDateString()}</span>
            </label>
        {/each}
    </div>

    <div class="button-group">
        <button
            type="button"
            class="cancel"
            on:click={handleCancel}
        >
            Cancel
        </button>
        <button
            type="button"
            class="confirm"
            on:click={handleConfirm}
            disabled={selectedEntryTimestamps.size < 2}
        >
            Compare ({selectedEntryTimestamps.size})
        </button>
    </div>
</dialog>

<style>
    dialog {
        position: fixed;
        padding: 24px;
        border-radius: 16px;
        max-width: 600px;
        width: 90%;
        border: none;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
                    0 10px 10px -5px rgba(0, 0, 0, 0.04);
        max-height: 80vh;
        overflow-y: auto;
    }

    dialog::backdrop {
        background-color: rgba(0, 0, 0, 0.5);
    }

    h2 {
        margin: 0 0 8px 0;
        color: var(--text-color);
        font-size: 1.3rem;
    }

    p {
        margin: 0 0 20px 0;
        color: #4B5563;
        line-height: 1.5;
        font-size: 0.9rem;
    }

    .entries-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
        gap: 12px;
        margin-bottom: 20px;
        max-height: 50vh;
        overflow-y: auto;
    }

    .entry-card {
        display: flex;
        flex-direction: column;
        align-items: center;
        border: 2px solid var(--border-color);
        border-radius: 8px;
        padding: 8px;
        cursor: pointer;
        transition: all 0.2s ease;
        position: relative;
        background: white;
    }

    .entry-card:hover {
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        transform: translateY(-1px);
    }

    .entry-card.selected {
        border-color: var(--primary-color);
        box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
    }

    .entry-card input[type="checkbox"] {
        position: absolute;
        top: 6px;
        left: 6px;
        z-index: 10;
        transform: scale(1.2);
    }

    .entry-card img {
        width: 100%;
        height: 70px;
        object-fit: contain;
        border-radius: 4px;
        margin-bottom: 6px;
    }

    .timestamp-label {
        font-size: 0.7rem;
        color: #666;
        text-align: center;
        line-height: 1.2;
    }

    .button-group {
        display: flex;
        justify-content: flex-end;
        gap: 12px;
    }

    button {
        padding: 8px 16px;
        border-radius: 8px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
        border: none;
        font-size: 0.9rem;
    }

    .cancel {
        background-color: #E5E7EB;
        color: #374151;
    }

    .cancel:hover {
        background-color: #D1D5DB;
    }

    .confirm {
        background-color: var(--primary-color);
        color: white;
    }

    .confirm:hover:not(:disabled) {
        background-color: var(--primary-hover);
    }
    
    .confirm:disabled {
        background-color: #CBD5E1;
        cursor: not-allowed;
    }
</style> 