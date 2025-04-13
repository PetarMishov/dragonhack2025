import { NewLinePipe } from './new-line.pipe';
import { TestBed } from '@angular/core/testing';
import { DomSanitizer } from '@angular/platform-browser';

describe('NewLinePipe', () => {
  let sanitizer: DomSanitizer;
  
  beforeEach(() => {
    TestBed.configureTestingModule({});
    sanitizer = TestBed.inject(DomSanitizer);
  });

  it('create an instance', () => {
    const pipe = new NewLinePipe(sanitizer);
    expect(pipe).toBeTruthy();
  });

  it('should transform newlines to <br> tags', () => {
    const pipe = new NewLinePipe(sanitizer);
    const testString = 'Line 1\nLine 2\nLine 3';
    spyOn(sanitizer, 'bypassSecurityTrustHtml').and.callThrough();
    
    pipe.transform(testString);
    
    expect(sanitizer.bypassSecurityTrustHtml).toHaveBeenCalledWith('Line 1<br>Line 2<br>Line 3');
  });
  
  it('should convert markdown bold to HTML bold', () => {
    const pipe = new NewLinePipe(sanitizer);
    const testString = 'This is **bold** text';
    spyOn(sanitizer, 'bypassSecurityTrustHtml').and.callThrough();
    
    pipe.transform(testString);
    
    expect(sanitizer.bypassSecurityTrustHtml).toHaveBeenCalledWith('This is <b>bold</b> text');
  });
  
  it('should convert markdown italic to HTML italic', () => {
    const pipe = new NewLinePipe(sanitizer);
    const testString = 'This is *italic* text';
    spyOn(sanitizer, 'bypassSecurityTrustHtml').and.callThrough();
    
    pipe.transform(testString);
    
    expect(sanitizer.bypassSecurityTrustHtml).toHaveBeenCalledWith('This is <i>italic</i> text');
  });
  
  it('should handle all transformations together', () => {
    const pipe = new NewLinePipe(sanitizer);
    const testString = 'Title\n\nThis is **bold** and this is *italic*\nNew line';
    spyOn(sanitizer, 'bypassSecurityTrustHtml').and.callThrough();
    
    pipe.transform(testString);
    
    expect(sanitizer.bypassSecurityTrustHtml).toHaveBeenCalledWith(
      'Title<br><br>This is <b>bold</b> and this is <i>italic</i><br>New line'
    );
  });
  
  it('should return empty string for falsy values', () => {
    const pipe = new NewLinePipe(sanitizer);
    expect(pipe.transform('')).toBe('');
    expect(pipe.transform(null as unknown as string)).toBe('');
    expect(pipe.transform(undefined as unknown as string)).toBe('');
  });
});