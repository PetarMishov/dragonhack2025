class Scenario {
    _id!: string;
    characterId!:string;
    title!: string;
    contextPrompt!: string;
    description!: string;
}

class ScenarioList{
    scenarios! : Scenario[];
    character! : string;
}

export { Scenario, ScenarioList };