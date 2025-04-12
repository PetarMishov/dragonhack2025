class Chat {
    id!: string;
    title!: string;
    characterId!: string
    scenarioId!: string
    messages!: string[];
    lastInteraction!: Date;
}
  
export { Chat };