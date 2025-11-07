import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PefilEmpresaService } from 'src/app/services/pefil-empresa.service';
import { Url } from 'src/app/modelos/url'; // url: 'https://localhost:7100', // URL local

// Clases
import { Login } from 'src/app/Clases/login';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  LoginForm: FormGroup;
  isLoggedIn: boolean = false;
  username: string = '';
  token = localStorage.getItem('token');

  listaEmpresa: any[] = [];

  constructor(
    private router: Router,
    private toastr: ToastrService,
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private pefilEmpresaService: PefilEmpresaService
  ) {
    this.LoginForm = this.formBuilder.group({
      UsuarioNombre: ['', Validators.required],
      Clave: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    if (!this.token) {
      this.logout()
    }else{
      // Nos suscribimos al estado reactivo del login y usuario
      this.authService.isLoggedIn$.subscribe(logged => {
      this.isLoggedIn = logged;
      });
      
      this.authService.username$.subscribe(name => {
      this.username = name; //aqui capturo el nombre de usuario
      });
    
    }
    this.obtenerDatos()
  }

    // Si necesitas construir la URL completa del logo:
  getLogoUrl(logo: string): string {
    return logo ? `${Url.url}/${logo}` : 'assets/img/logo.png';  // Concatenamos baseUrl con el logo
  }

  obtenerDatos(): void {
    this.pefilEmpresaService.getListPerfilEmpresa().subscribe(
      (data) => {
        if (data && data.length > 0) {
          this.listaEmpresa = data;
        }
      },
      (error) => {
        console.error('Error al obtener los datos', error);
      }
    );
  }

  login() {
    if (this.LoginForm.invalid) {
      this.toastr.warning('⚠️ Por favor, completa todos los campos.', 'Advertencia');
      return;
    }
  
    const loginData: Login = this.LoginForm.value;
  
    this.authService.Login(loginData).subscribe({
      next: (response) => {
        if (response.data && response.token) {
          this.authService.login(response.token); // ✅ Aquí notificamos al servicio
          this.toastr.success('😄 ' + response.mensaje, 'Éxito');
          this.router.navigate(['/add_venta']);
        } else {
          this.toastr.error('😢 ' + response.mensaje, 'Error');
        }
      },
      error: (error) => {
        this.toastr.error('😢 Error en el inicio de sesión. Verifica tus credenciales.', 'Error');
        console.error(error);
      }
    });
  }
  
  
  logout() {
    this.authService.logout();
    this.toastr.success('✌️ Has cerrado sesión correctamente.');
    this.router.navigate(['/login']);
  }
  

}
