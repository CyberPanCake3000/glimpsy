export type ScenarioNode = {
    id: string;
    type: 'event' | 'action';
    text: string;
    emoji?: string;
};

export type ScenarioEdge = {
    source: string;
    target: string;
};

export type GeneratedScenario = {
    title: string;
    nodes: ScenarioNode[];
    edges: ScenarioEdge[];
};

export type GenerateScenariosResponse = {
    scenarios: GeneratedScenario[];
};