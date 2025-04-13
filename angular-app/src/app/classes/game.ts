import { Character } from "./character";

class Game {
}

class GameResponseData{
    gameId!: string;
    currentPoints!: number;
    status!: string;
}

class GameResponse{
    success! : boolean;
    data! : GameResponseData;
}

class Question {
    content!: string;
    answer!: string;
    pointsDeducted!: number;
    timestamp!: {
        type: Date,
        default: Date
    }
}

class QuestionResponseData{
    answer! : string;
    currentPoints!: number;
    pointsDeducted!: number;
    status!: string;
}

class QuestionResponse{
    success!: boolean;
    data! : QuestionResponseData;
}

class GuessResponseData{
    correct!: boolean;
    finalPoints!: number;
    character!: Character;
}

class GuessResponse{
    success!: boolean;
    data!: GuessResponseData;
}

export { Game, GameResponse, GameResponseData, Question, QuestionResponse, GuessResponse };