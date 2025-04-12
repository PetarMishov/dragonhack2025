class Chat {
    _id!: string;
    title!: string;
    characterId!: string
    scenarioId!: string
    messages!: Message[];
    lastInteraction!: Date;
}

class Message {
    _id!: string
    role!: string;
    content!: string;
    timestamp!: Date;
}
  
export { Chat };