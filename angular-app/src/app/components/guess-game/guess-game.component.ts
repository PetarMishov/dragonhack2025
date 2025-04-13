import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { Router } from '@angular/router';
import { BackgroundComponent } from '../background/background/background.component';
import { StartGuessGameService } from '../../services/start-guess-game/start-guess-game.service.spec';
import { GameResponseData } from '../../classes/game';
import { AskQuestionService } from '../../services/ask-question/ask-question.service.spec';
import { QuestionResponse } from '../../classes/game';
import { Character } from '../../classes/character';
import { MakeGuessService } from '../../services/make-guess/make-guess.service.spec';
import { GetAllPersonasService } from '../../services/get-all-personas/get-all-personas.service.spec';
import confetti from 'canvas-confetti';
import { AppCardComponent } from '../app-card/app-card.component';
import { Chat } from '../../classes/chat';
import { GetAllChatsService } from '../../services/get-all-chats/get-all-chats.service.spec';
import { RouterLink } from '@angular/router';
import { DOCUMENT } from '@angular/common';
import { Inject } from '@angular/core';

@Component({
  selector: 'app-guess-game',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterOutlet, BackgroundComponent, AppCardComponent, RouterLink],
  templateUrl: './guess-game.component.html',
  styleUrl: './guess-game.component.css'
})
export class GuessGameComponent {
  
  constructor(private readonly startGuessGameService: StartGuessGameService,
    private readonly askQuestionService: AskQuestionService,
    private readonly makeGuessService: MakeGuessService,
    private readonly getAllPersonasService: GetAllPersonasService,
    private readonly router: Router,
    private readonly getAllChatsService : GetAllChatsService,
    @Inject(DOCUMENT) private document: Document
  ){}

  newMessage: string = '';
  game_id!: string;
  current_points!: number;
  messages: { role: 'user' | 'ai', content: string }[] = [];
  allCharacters!: Character[];
  searchText: string = '';
  gameOver: boolean = false;
  correctAnswer: string = '';
  isCorrect: boolean = false;
  clickToNavigate: boolean = false; // Flag to enable click-to-navigate
  protected chats?: Chat[];
  


  ngOnInit(){
    this.startGuessGameService.startGame().subscribe((out_game_reponse) => {
      this.game_id = out_game_reponse.data.gameId;
      this.current_points = out_game_reponse.data.currentPoints;
    });
    this.getPersonas();
    this.getChats();
  }

  private getChats() {
    this.getAllChatsService.getChats()
    .subscribe((out_chats) => {
      console.log(out_chats);
      this.chats = out_chats;
    });
  }

  public getPersonas() {
    this.getAllPersonasService.getPersonas()
    .subscribe((out_personas) => {
      console.log(out_personas);
      this.allCharacters = out_personas;
    });
  }

  sendMessage(): void {
    if (this.current_points <= 0) {
      alert("No more points");
      return;
    }

    const trimmed = this.newMessage.trim();
    if (!trimmed) return;
  
    this.askQuestionService.askQuestion(this.game_id, trimmed).subscribe((out_question_response) => {
      this.messages.push({role: 'user', content: trimmed});
      this.messages.push({role: 'ai', content: out_question_response.data.answer});
      this.current_points = out_question_response.data.currentPoints;
    });
    
    this.newMessage = '';
  }

  makeGuess(persona: Character): void {
    if (this.gameOver) return;
    
    this.makeGuessService.askQuestion(this.game_id, persona.name).subscribe((out_guess_response) => {
      this.gameOver = true;
      this.correctAnswer = out_guess_response.data.character.name;
      this.isCorrect = out_guess_response.data.correct;
      
      if (this.isCorrect) {
        this.triggerConfetti();
        // this.router.navigate(['/start']);
        setTimeout(() => {
          this.clickToNavigate = true;
        }, 1500);
      } else {
        // alert("Incorrect! The correct answer was " + this.correctAnswer);
        this.showIncorrectX();
        setTimeout(() => {
          this.clickToNavigate = true;
        }, 2000);
      }
    });
  }

  onBackgroundClick(): void {
    
    if (this.clickToNavigate) {
      this.router.navigate(['/']);
    }
  }

  triggerConfetti(): void {
    // Duration in milliseconds
    const duration = 5 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min: number, max: number) => {
      return Math.random() * (max - min) + min;
    };

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      
      // Launch confetti from both sides
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      });
      
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      });
    }, 250);
  }

  showIncorrectX(): void {
    // Create overlay element
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100vw';
    overlay.style.height = '100vh';
    overlay.style.backgroundColor = 'rgba(255, 0, 0, 0.2)';
    overlay.style.zIndex = '9999';
    overlay.style.display = 'flex';
    overlay.style.flexDirection = 'column';
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'center';
    
    // Create X element
    const x = document.createElement('div');
    x.textContent = '✖';
    x.style.color = 'red';
    x.style.fontSize = '15rem';
    x.style.fontWeight = 'bold';
    
    // Create message element
    const message = document.createElement('div');
    message.textContent = `Incorrect! The correct answer was ${this.correctAnswer}`;
    message.style.color = 'white';
    message.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    message.style.padding = '1rem 2rem';
    message.style.borderRadius = '4px';
    message.style.fontSize = '1.5rem';
    message.style.marginTop = '2rem';
    
    // Add elements to overlay
    overlay.appendChild(x);
    overlay.appendChild(message);
    
    // Add overlay to body
    document.body.appendChild(overlay);
    
    // Remove after 2 seconds
    setTimeout(() => {
      document.body.removeChild(overlay);
    }, 2000);
  }

  filteredCharacters(): Character[] {
    return this.allCharacters.filter(persona =>
      persona.name.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }

  public navigateToChat(chatId: string) {
    this.router.navigate(['/chat', chatId]);
  }

  public refresh(){
    this.document.defaultView?.location.reload();
  }
}