import { Component, OnInit } from '@angular/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';


@Component({
  selector: 'app-first-page',
  standalone: true,
  imports: [CommonModule, MatProgressBarModule, MatButtonModule],
  templateUrl: './first-page.component.html',
  styleUrl: './first-page.component.css'
})
export class FirstPageComponent implements OnInit {
  loadingComplete = false;

  constructor(private router: Router) {}

  ngOnInit(): void {
    setTimeout(() => {
      this.loadingComplete = true;
    }, 3000);
  }

  goToIndex(): void {
    this.router.navigate(['/index']);
  }
}

