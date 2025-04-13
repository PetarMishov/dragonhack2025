import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { BackgroundComponent } from '../background/background/background.component';
import { StartGuessGameService } from '../../services/start-guess-game/start-guess-game.service.spec';
import { GameResponseData } from '../../classes/game';
import { AskQuestionService } from '../../services/ask-question/ask-question.service.spec';
import { QuestionResponse } from '../../classes/game';
import { Character } from '../../classes/character';
import { MakeGuessService } from '../../services/make-guess/make-guess.service.spec';
import { GetAllPersonasService } from '../../services/get-all-personas/get-all-personas.service.spec';

@Component({
  selector: 'app-guess-game',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterOutlet, BackgroundComponent],
  templateUrl: './guess-game.component.html',
  styleUrl: './guess-game.component.css'
})
export class GuessGameComponent {
  
  constructor(private readonly startGuessGameService : StartGuessGameService,
    private readonly askQuestionService : AskQuestionService,
    private readonly makeGuessService : MakeGuessService,
    private readonly getAllPersonasService : GetAllPersonasService
  ){}

  newMessage: string = '';
  game_id! : string;
  current_points! : number;
  messages: { role: 'user' | 'ai', content: string }[] = [];
  allCharacters! : Character[];
  searchText: string = ''

  ngOnInit(){
    this.startGuessGameService.startGame().subscribe((out_game_reponse) => {
      this.game_id = out_game_reponse.data.gameId
      this.current_points = out_game_reponse.data.currentPoints
    })
    this.getPersonas()
  }

  public getPersonas() {
    this.getAllPersonasService.getPersonas()
    .subscribe((out_personas) => {
      console.log(out_personas)
      this.allCharacters = out_personas
    })
  }

  sendMessage(): void {
    if (this.current_points <= 0) {
      alert("No more points")
      return
    }

    const trimmed = this.newMessage.trim();
    if (!trimmed) return;
  
    this.askQuestionService.askQuestion(this.game_id, trimmed).subscribe((out_question_response) => {
      this.messages.push({role : 'user', content : trimmed})
      this.messages.push({role: 'ai', content: out_question_response.data.answer})
      this.current_points = out_question_response.data.currentPoints
    })
    
    this.newMessage = '';
  }

  makeGuess(persona : Character): void{
    this.makeGuessService.askQuestion(this.game_id, persona.name).subscribe((out_guess_response) => {
      var correct_character = out_guess_response.data.character.name
      if (out_guess_response.data.correct) {
        alert("Correct")
      }else{
        alert("Incorrect")
        alert(correct_character)
      }
      
    })
  }

  filteredCharacters(): Character[] {
    return this.allCharacters.filter(persona =>
      persona.name.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }
}
