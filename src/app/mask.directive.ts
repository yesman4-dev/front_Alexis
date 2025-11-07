// para aplicar la mascara de entrada tipo ID
import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appMask]'
})
export class MaskDirective {

  constructor(private el: ElementRef) { }

  @HostListener('input', ['$event'])
  onInput(event: Event) {
    const input = event.target as HTMLInputElement;
    let value = input.value;

   
    value = value.replace(/\D/g, '');
    value = value.slice(0, 15);
    value = value.replace(/(\d{4})(\d{4})(\d{5})/, '$1-$2-$3');

   
    const maxLength = 15;
    if (value.length > maxLength) {
      value = value.slice(0, maxLength);
    }

    input.value = value;
  }

}
