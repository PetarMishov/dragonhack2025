import { Component, Input, ChangeDetectionStrategy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [MatCardModule, MatButtonModule],
  templateUrl: './app-card.component.html',
  styleUrls: ['./app-card.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppCardComponent implements AfterViewInit {
  @Input() name!: string;
  @Input() era!: string;
  @Input() baseContext!: string;
  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;
  
  isFocused = false;
  private videoEl: HTMLVideoElement | null = null;

  get videoPath(): string {
    return `/images/${this.name.toString().toLowerCase()}.mp4`;
  }
  
  ngAfterViewInit() {
    this.videoEl = this.videoElement?.nativeElement || null;
  }
    
  onCardFocus(focused: boolean) {
    this.isFocused = focused;
    
    if (this.videoEl) {
      if (focused) {
        this.videoEl.play().catch(err => console.log('Error playing video:', err));
      } else {
        this.videoEl.pause();
        // Optional: reset video to beginning when mouse leaves
        // this.videoEl.currentTime = 0;
      }
    }
  }
}