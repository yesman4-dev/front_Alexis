import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { BackendMessage } from 'src/app/modelos/backend-message';
import { PefilEmpresaService } from 'src/app/services/pefil-empresa.service';
import { ProductoService } from 'src/app/services/producto.service';
import { Url } from 'src/app/modelos/url';

@Component({
  selector: 'app-perfil-empresa',
  templateUrl: './perfil-empresa.component.html',
  styleUrls: ['./perfil-empresa.component.css']
})
export class PerfilEmpresaComponent implements OnInit {

  lista: any[] = [];
  cargando: boolean = false;
  logoPortadaUrl: string = ''; // Para mostrar el logo como portada
  archivoLogoSeleccionado: File | null = null; // Guardamos el archivo del logo solo si el usuario selecciona uno
  empresaForm: FormGroup;

  constructor(
    private pefilEmpresaService: PefilEmpresaService,
    private toastr: ToastrService,
    private fb: FormBuilder,
    private productoService: ProductoService
  ) {
    this.empresaForm = this.fb.group({
      nombreEmpresa: ['', Validators.required],
      rtn: [''],
      direccion: [''],
      telefono: [''],
      logo: [], // Esta propiedad contendrá solo la URL relativa del logo
      eslogan: ['']
    });
  }

  ngOnInit(): void {
    this.obtenerDatos();
  }

  obtenerDatos(): void {
    this.pefilEmpresaService.getListPerfilEmpresa().subscribe(
      (data) => {
        if (data && data.length > 0) {
          const empresa = data[0];
          this.lista = data;

          // Llenar el formulario con los datos
          this.empresaForm.patchValue({
            nombreEmpresa: empresa.nombreEmpresa,
            rtn: empresa.rtn,
            direccion: empresa.direccion,
            telefono: empresa.telefono,
            eslogan: empresa.eslogan
          });

          // Mostrar el logo como portada
          this.logoPortadaUrl = empresa.logo ? Url.url + '/' + empresa.logo : ''; // Se añade la URL base solo si existe el logo
        }
      },
      (error) => {
        console.error('Error al obtener los datos', error);
      }
    );
  }

  guardarCambios(): void {
    if (this.empresaForm.invalid || this.lista.length === 0) {
      this.toastr.warning('Formulario inválido o datos no cargados');
      return;
    }
  
    const id = this.lista[0].id;
    const cuerpo = this.empresaForm.value;
    this.cargando = true;
  
    // Si se seleccionó un nuevo logo, primero subimos el archivo
    if (this.archivoLogoSeleccionado) {
      this.productoService.SubirArchivo(this.archivoLogoSeleccionado).subscribe({
        next: (resp) => {
          if (resp.data?.url) {
            cuerpo.logo = resp.data.url; // Solo se guarda la ruta relativa del logo
          }
          this.enviarActualizacion(id, cuerpo);
        },
        error: (error) => {
          console.error('Error al subir el archivo:', error);
          this.toastr.error('Error al subir el logo');
          this.cargando = false;
        }
      });
    } else {
      // No se seleccionó un nuevo logo, conservamos el logo anterior
      cuerpo.logo = this.logoPortadaUrl ? this.logoPortadaUrl.replace(Url.url + '/', '') : ''; // Mantener la URL anterior
      this.enviarActualizacion(id, cuerpo);
    }
  }
  

  private enviarActualizacion(id: number, cuerpo: any): void {
    this.pefilEmpresaService.ModificarEmpresa(id, cuerpo).subscribe({
      next: (respuesta) => {
        this.toastr.success(respuesta.mensaje || 'Empresa actualizada correctamente');
        this.obtenerDatos(); // Refrescamos datos y vista previa
        this.cargando = false;
        this.archivoLogoSeleccionado = null; // Limpiar referencia del archivo
      },
      error: (error) => {
        console.error('Error al actualizar la empresa:', error);
        this.toastr.error('Ocurrió un error al guardar los cambios');
        this.cargando = false;
      }
    });
  }

  // Método para seleccionar el logo
  onLogoSeleccionado(event: any): void {
    const archivo: File = event.target.files[0];
    if (!archivo) return;

    this.archivoLogoSeleccionado = archivo; // Guardamos el archivo solo cuando el usuario selecciona uno
    const reader = new FileReader();
    reader.onload = () => {
      this.logoPortadaUrl = reader.result as string; // Mostramos la vista previa del logo seleccionado
    };
    reader.readAsDataURL(archivo);
  }

  // Método para restablecer el formulario, incluyendo el logo
  restablecerFormulario(): void {
    this.obtenerDatos(); // Refresca los datos de la empresa (incluye el logo)
    this.empresaForm.reset(); // Resetea el formulario
  }
}
