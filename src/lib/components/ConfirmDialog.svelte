<script lang="ts">
    export let show = false;
    export let title: string;
    export let message: string;
    export let onConfirm: () => void;
    export let onCancel: () => void;
</script>

{#if show}
<div class="modal-backdrop" on:click={onCancel}>
    <div class="modal-content" on:click|stopPropagation>
        <h2>{title}</h2>
        <p>{message}</p>
        <div class="button-group">
            <button class="cancel" on:click={onCancel}>Cancel</button>
            <button class="confirm" on:click={onConfirm}>Confirm</button>
        </div>
    </div>
</div>
{/if}

<style>
    .modal-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        width: 90%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    }

    .modal-content {
        background: white;
        padding: 24px;
        border-radius: 16px;
        max-width: 400px;
        width: 90%;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
                    0 10px 10px -5px rgba(0, 0, 0, 0.04);
    }

    h2 {
        margin: 0 0 16px 0;
        color: var(--text-color);
        font-size: 1.5rem;
    }

    p {
        margin: 0 0 24px 0;
        color: #4B5563;
        line-height: 1.5;
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
    }

    .cancel {
        background-color: #E5E7EB;
        color: #374151;
    }

    .cancel:hover {
        background-color: #D1D5DB;
    }

    .confirm {
        background-color: #EF4444;
        color: white;
    }

    .confirm:hover {
        background-color: #DC2626;
    }
</style> 