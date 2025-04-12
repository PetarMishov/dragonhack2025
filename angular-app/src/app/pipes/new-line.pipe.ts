import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'newLine',
  standalone: true
})
export class NewLinePipe implements PipeTransform {

  constructor(private sanitizer: DomSanitizer) {}

  transform(value: string): SafeHtml {
    if (!value) {
      return '';
    }
    
    // Replace newlines with <br> tags
    let transformed = value.replace(/\n/g, '<br>');
    
    // Convert markdown bold (**text**) to HTML bold
    transformed = transformed.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
    
    // Convert markdown italic (*text*) to HTML italic
    transformed = transformed.replace(/\*(.*?)\*/g, '<i>$1</i>');
    
    // Return as trusted HTML to render properly
    return this.sanitizer.bypassSecurityTrustHtml(transformed);
  }
}