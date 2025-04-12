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

class MessageResponseData{
    message! : string;
    personaId! : string;
}

class MessageResponse{
    data! : MessageResponseData
    success! : boolean
}

class MessageReq{
    message! : string;
}


class ChatReq{
    characterId! : string;
    scenarioId! : string;
    title! : string;
}

class ChatResponse{
    data! : Chat
    success! : boolean
}
  
export { Chat, MessageResponse, Message, MessageReq, ChatReq, ChatResponse };