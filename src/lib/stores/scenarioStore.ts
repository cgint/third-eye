import { writable, get } from 'svelte/store';

export interface Scenario {
    id: string;
    name: string;
    instructions: string;
    isEditable: boolean;
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
        isEditable: false
    },
    {
        id: 'not-food-product',
        name: 'General Object Analysis',
        instructions: 'In case there is no product on the picture, then omit the nutritional information and only describe what you can identify on the picture and what might be of specific interest to the user.',
        isEditable: false
    }
];

// Create stores
export const scenarios = writable<Scenario[]>([...defaultScenarios]);
export const selectedScenarioId = writable<string>(defaultScenarios[0].id);

// Load scenarios from localStorage on initialization
if (typeof window !== 'undefined') {
    const savedScenarios = localStorage.getItem('userScenarios');
    if (savedScenarios) {
        const userScenarios = JSON.parse(savedScenarios);
        scenarios.set([...defaultScenarios, ...userScenarios]);
    }

    const savedSelectedId = localStorage.getItem('selectedScenarioId');
    if (savedSelectedId) {
        selectedScenarioId.set(savedSelectedId);
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
        isEditable: true
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