import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DecodedToken } from 'src/app/modelos/decoded-token';
import { jwtDecode } from 'jwt-decode';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit{
  token = localStorage.getItem('token');
  IdUser: number | null = null;



  constructor(private router: Router) {}


  ngOnInit(): void {
      if (this.token) {
        try {
          const decodedToken = jwtDecode<DecodedToken>(this.token);
          //console.log('Token decodificado:', decodedToken); // Verifica cómo llega TieneEmpresa
          this.IdUser = Number(decodedToken.nameid);

        
        } catch (error) {
         
        }
      }
  }


  icons = [
    { label: 'Juegos', imgUrl: 'assets/img/game-console.png' },
    { label: 'Mensajes', imgUrl: 'assets/img/chat.png' },
    { label: 'Contenido', imgUrl: 'assets/img/newspaper.png' },
    { label: 'Amigos', imgUrl: 'assets/img/people.png' },
    { label: 'Grupos', imgUrl: 'assets/img/music.png' },
    { label: 'Tiendas', imgUrl: 'assets/img/online-shopping.png' },
    { label: 'Restaurantes', imgUrl: 'assets/img/fast-food.png' },
    { label: 'Perfil', imgUrl: 'assets/img/profile.png' },
    { label: 'Galería', imgUrl: 'assets/img/picture.png' },
    { label: 'Configuración', imgUrl: 'assets/img/gears.png' },
  ];

  navigateTo(label: string): void {
    if (label === 'Tiendas') {
      this.router.navigate(['/tiendaropa']);
    }
    if (label === 'Mensajes') {
      this.router.navigate([`/Bandeja_User/${this.IdUser}`]);
    }
    if(label === 'Contenido')
    {
      this.router.navigate(['/Contenido'])
    }
    if(label === 'Amigos')
      {
        this.router.navigate(['/amigos'])
      }
    
    // Agrega más condiciones para otras opciones según sea necesario
  }

  

}
