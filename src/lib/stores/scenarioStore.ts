import { writable, get } from 'svelte/store';

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

// Create stores with empty initial state
export const scenarios = writable<Scenario[]>([]);
export const selectedScenarioId = writable<string>('');

// Load scenarios from localStorage on initialization
if (typeof window !== 'undefined') {
    const savedScenarios = localStorage.getItem('userScenarios');
    const userScenarios = savedScenarios ? JSON.parse(savedScenarios) : [];
    
    // Combine default and user scenarios, ensuring no duplicates
    const combinedScenarios = [
        ...defaultScenarios,
        ...userScenarios.filter((us: Scenario) => 
            !defaultScenarios.some(ds => ds.id === us.id)
        )
    ];
    
    scenarios.set(combinedScenarios);

    const savedSelectedId = localStorage.getItem('selectedScenarioId');
    if (savedSelectedId) {
        selectedScenarioId.set(savedSelectedId);
    } else {
        selectedScenarioId.set(defaultScenarios[0].id);
    }

    // Subscribe to changes and save to localStorage
    scenarios.subscribe(value => {
        const userScenarios = value.filter(s => s.isEditable);
        localStorage.setItem('userScenarios', JSON.stringify(userScenarios));
    });

    selectedScenarioId.subscribe(value => {
        localStorage.setItem('selectedScenarioId', value);
    });
}

// Helper functions
export function addScenario(name: string, instructions: string): void {
    const id = `custom-${Date.now()}`;
    const newScenario: Scenario = {
        id,
        name,
        instructions,
        isEditable: true,
        displayInManageView: true
    };
    scenarios.update(s => [...s, newScenario]);
}

export function updateScenario(id: string, name: string, instructions: string): void {
    scenarios.update(s => 
        s.map(scenario => 
            scenario.id === id && scenario.isEditable 
                ? { ...scenario, name, instructions }
                : scenario
        )
    );
}

export function deleteScenario(id: string): void {
    scenarios.update(s => {
        const scenario = s.find(sc => sc.id === id);
        if (!scenario?.isEditable) return s;
        
        const newScenarios = s.filter(sc => sc.id !== id);
        if (get(selectedScenarioId) === id) {
            selectedScenarioId.set(defaultScenarios[0].id);
        }
        return newScenarios;
    });
}

export function getSelectedScenario(): Scenario | undefined {
    return get(scenarios).find(s => s.id === get(selectedScenarioId));
} 