import { writable, get, type Writable } from 'svelte/store';
import { browser } from '$app/environment';

export interface Scenario {
    id: string;
    name: string;
    instructions: string;
    isEditable: boolean;
    displayInManageView: boolean;
}

// Default scenarios that cannot be edited
const defaultScenarios: Scenario[] = [
    {
        id: 'food-product',
        name: 'Food Product Analysis',
        instructions: `Analyze this product image and provide:
1. First an most important: Information regarding allergens and ingredients that could cause allergic reactions
a. gluten
b. dairy
c. nuts
d. soy
e. other
2. Information regarding the product's nutritional value, including calories, protein, carbohydrates, and fat
3. Any relevant product details

Start with a very short and easy to grasp table with two columns where the first names the allergen or ingredient
and the second column contains very short information if the product contains the allergen or ingredient.
Please be specific and concise in your response.
People should get a good idea of what the product is about and if it might be suitable for them.`,
        isEditable: false,
        displayInManageView: true
    },
    {
        id: 'not-food-product',
        name: 'General Object Analysis',
        instructions: `Describe what you can identify on the picture and what might be of specific interest to the user.`,
        isEditable: false,
        displayInManageView: true
    },
    {
        id: 'custom',
        name: 'Custom Instructions',
        instructions: '',
        isEditable: false,
        displayInManageView: false
    }
];

interface ScenarioStores {
    scenarios: Writable<Scenario[]>;
    selectedScenarioId: Writable<string>;
    addScenario: (name: string, instructions: string) => void;
    updateScenario: (id: string, name: string, instructions: string) => void;
    deleteScenario: (id: string) => void;
    getSelectedScenario: () => Scenario | undefined;
}

let scenarioStores: ScenarioStores | null = null;

export const getScenarioStores = () => {
    if (!scenarioStores) {
        // Create stores with empty initial state
        const scenariosStore = writable<Scenario[]>([]);
        const selectedScenarioIdStore = writable<string>('');

        // Load scenarios from localStorage on initialization
        if (browser) {
            const savedScenarios = localStorage.getItem('userScenarios');
            const userScenarios = savedScenarios ? JSON.parse(savedScenarios) as Scenario[] : [];
            
            // Combine default and user scenarios, ensuring no duplicates
            const combinedScenarios = [
                ...defaultScenarios,
                ...userScenarios.filter((us: Scenario) => 
                    !defaultScenarios.some(ds => ds.id === us.id)
                )
            ];
            
            scenariosStore.set(combinedScenarios);

            const savedSelectedId = localStorage.getItem('selectedScenarioId');
            if (savedSelectedId) {
                selectedScenarioIdStore.set(savedSelectedId);
            } else {
                selectedScenarioIdStore.set(defaultScenarios[0].id);
            }

            // Subscribe to changes and save to localStorage
            scenariosStore.subscribe(value => {
                const userScenarios = value.filter(s => s.isEditable);
                if (userScenarios.length === 0) {
                    localStorage.removeItem('userScenarios');
                } else {
                    localStorage.setItem('userScenarios', JSON.stringify(userScenarios));
                }
            });

            selectedScenarioIdStore.subscribe(value => {
                if (value == defaultScenarios[0].id) {
                    localStorage.removeItem('selectedScenarioId');
                } else {
                    localStorage.setItem('selectedScenarioId', value);
                }
            });
        }

        scenarioStores = {
            scenarios: scenariosStore,
            selectedScenarioId: selectedScenarioIdStore,
            addScenario: (name: string, instructions: string) => {
                const id = `custom-${Date.now()}`;
                const newScenario: Scenario = {
                    id,
                    name,
                    instructions,
                    isEditable: true,
                    displayInManageView: true
                };
                scenariosStore.update(s => [...s, newScenario]);
            },
            updateScenario: (id: string, name: string, instructions: string) => {
                scenariosStore.update(s => 
                    s.map(scenario => 
                        scenario.id === id && scenario.isEditable 
                            ? { ...scenario, name, instructions }
                            : scenario
                    )
                );
            },
            deleteScenario: (id: string) => {
                scenariosStore.update(s => {
                    const scenario = s.find(sc => sc.id === id);
                    if (!scenario?.isEditable) return s;
                    
                    const newScenarios = s.filter(sc => sc.id !== id);
                    const currentSelectedId = get(selectedScenarioIdStore);
                    if (currentSelectedId === id) {
                        selectedScenarioIdStore.set(defaultScenarios[0].id);
                    }
                    return newScenarios;
                });
            },
            getSelectedScenario: () => {
                return get(scenariosStore).find(s => s.id === get(selectedScenarioIdStore));
            }
        };
    }
    
    return scenarioStores;
};

// Use in components:
// const { scenarios, selectedScenarioId, addScenario, updateScenario, deleteScenario, getSelectedScenario } = getScenarioStores();