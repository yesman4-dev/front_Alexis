import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.css']
})
export class WelcomeComponent implements OnInit{

  constructor(private router: Router) { }

  ngOnInit(): void {
    // Redirige a la página principal después de 3 segundos
    setTimeout(() => {
      this.router.navigate(['/BandejaChat']); 
    }, 3000); //tiempo de espera
  }

}
