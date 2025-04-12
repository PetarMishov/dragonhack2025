import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { GetAllPersonasService } from '../../services/get-all-personas/get-all-personas.service.spec';
import { Character } from '../../classes/character';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-start',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  templateUrl: './start.component.html',
  styleUrl: './start.component.css'
})
export class StartComponent {
  constructor(private readonly getAllPersonasService : GetAllPersonasService
  ){}

  protected personas?: Character[];

  ngOnInit(){
    this.getPersonas()
  }

  private getPersonas() {
    this.getAllPersonasService.getPersonas()
    .subscribe((out_personas) => {
      console.log(out_personas)
      this.personas = out_personas
    })
  }
}
