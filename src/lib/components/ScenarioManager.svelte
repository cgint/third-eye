<script lang="ts">
    import { getScenarioStores, type Scenario } from '$lib/stores/scenarioStore';
    import { createEventDispatcher } from 'svelte';

    const { scenarios, selectedScenarioId, addScenario, updateScenario, deleteScenario } = getScenarioStores();
    const dispatch = createEventDispatcher();
    let editingScenario: Scenario | null = null;
    let newScenarioName = '';
    let newScenarioInstructions = '';

    function handleSave() {
        if (editingScenario) {
            updateScenario(editingScenario.id, newScenarioName, newScenarioInstructions);
            editingScenario = null;
        } else {
            addScenario(newScenarioName, newScenarioInstructions);
        }
        newScenarioName = '';
        newScenarioInstructions = '';
    }

    function startEdit(scenario: Scenario) {
        editingScenario = scenario;
        newScenarioName = scenario.name;
        newScenarioInstructions = scenario.instructions;
    }

    function cancelEdit() {
        editingScenario = null;
        newScenarioName = '';
        newScenarioInstructions = '';
    }

    function handleDelete(id: string) {
        if (confirm('Are you sure you want to delete this scenario?')) {
            deleteScenario(id);
        }
    }

    function closeManager() {
        dispatch('close');
    }
</script>

<div class="scenario-manager">
    <div class="header">
        <h2>Manage Scenarios</h2>
        <button class="close-button" on:click={closeManager}>×</button>
    </div>

    <div class="scenarios-list">
        {#each $scenarios as scenario}
            {#if scenario.displayInManageView}
                <div class="scenario-item">
                    <div class="scenario-info">
                        <h3>{scenario.name}</h3>
                    <p class="instructions">{scenario.instructions}</p>
                </div>
                {#if scenario.isEditable}
                    <div class="actions">
                        <button on:click={() => startEdit(scenario)}>Edit</button>
                        <button class="delete" on:click={() => handleDelete(scenario.id)}>Delete</button>
                    </div>
                {/if}
                </div>
            {/if}
        {/each}
    </div>

    <div class="editor">
        <h3>{editingScenario ? 'Edit Scenario' : 'Create New Scenario'}</h3>
        <div class="form">
            <label>
                Name:
                <input type="text" bind:value={newScenarioName} placeholder="Scenario name" />
            </label>
            <label>
                Instructions:
                <textarea bind:value={newScenarioInstructions} placeholder="Enter instructions for the AI" rows="4"></textarea>
            </label>
            <div class="button-group">
                <button on:click={handleSave} disabled={!newScenarioName || !newScenarioInstructions}>
                    {editingScenario ? 'Save Changes' : 'Add Scenario'}
                </button>
                {#if editingScenario}
                    <button on:click={cancelEdit}>Cancel</button>
                {/if}
            </div>
        </div>
    </div>
</div>

<style>
    .scenario-manager {
        background: white;
        padding: 2rem;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        max-width: 800px;
        margin: 0 auto;
    }

    .scenario-manager .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 2rem;
        padding-left: 1rem;
    }

    .scenario-manager .close-button {
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        padding: 0.5rem;
    }

    .scenarios-list {
        margin-bottom: 2rem;
    }

    .scenario-item {
        border: 1px solid var(--border-color);
        border-radius: 4px;
        padding: 1rem;
        margin-bottom: 1rem;
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
    }

    .scenario-info {
        flex: 1;
    }

    .scenario-info h3 {
        margin: 0 0 0.5rem 0;
    }

    .instructions {
        margin: 0;
        font-size: 0.9rem;
        color: #666;
        white-space: pre-wrap;
        text-align: left;
    }

    .actions {
        display: flex;
        gap: 0.5rem;
    }

    .editor {
        border-top: 1px solid var(--border-color);
        padding-top: 2rem;
    }

    .form {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    label {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    input, textarea {
        padding: 0.5rem;
        border: 1px solid var(--border-color);
        border-radius: 4px;
        font-family: inherit;
    }

    .button-group {
        display: flex;
        gap: 1rem;
        margin-top: 1rem;
    }

    button {
        padding: 0.5rem 1rem;
        border: none;
        border-radius: 4px;
        background: var(--primary-color);
        color: white;
        cursor: pointer;
    }

    button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    button.delete {
        background: #dc2626;
    }

    button:hover:not(:disabled) {
        background: var(--primary-hover);
    }
</style> 