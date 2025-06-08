<script lang="ts">
    let { show, title, message, confirm, cancel } = $props();

    let dialog: HTMLDialogElement;

    $effect(() => {
        if (dialog) {
            if (show && !dialog.open) {
                dialog.showModal();
            } else if (!show && dialog.open) {
                dialog.close();
            }
        }
    });

    function handleConfirm() {
        confirm();
        dialog.close();
    }

    function handleCancel() {
        cancel();
        dialog.close();
    }
</script>

<dialog
    bind:this={dialog}
    class="modal-content"
    aria-labelledby="dialog-title"
    aria-describedby="dialog-message"
>
    <h2 id="dialog-title">{title}</h2>
    <p id="dialog-message">{message}</p>
    <div class="button-group">
        <button 
            type="button"
            class="cancel" 
            onclick={handleCancel}
        >
            Cancel
        </button>
        <button 
            type="button"
            class="confirm" 
            onclick={handleConfirm}
        >
            Confirm
        </button>
    </div>
</dialog>

<style>
    dialog {
        position: fixed;
        padding: 24px;
        border-radius: 16px;
        max-width: 400px;
        width: 90%;
        border: none;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
                    0 10px 10px -5px rgba(0, 0, 0, 0.04);
    }

    dialog::backdrop {
        background-color: rgba(0, 0, 0, 0.5);
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