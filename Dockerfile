# Etapa 1: Build con Node 20
FROM node:20-alpine AS build

# Establece el directorio de trabajo
WORKDIR /app

# Copia los archivos de dependencias
COPY package*.json ./

# Instala dependencias con lockfile actualizado
RUN npm install

# Copia el resto del código fuente
COPY . .

# Construye la aplicación en modo producción
RUN npm run build --prod

# Etapa 2: Servidor NGINX liviano
FROM nginx:1.25.4-alpine

# Copia configuración personalizada de nginx
COPY ./config/default.conf /etc/nginx/conf.d/default.conf

# Copia los archivos construidos desde la etapa anterior
COPY --from=build /app/dist/reservaciones /var/www/app/

# Expone el puerto 80 para servir la app
EXPOSE 80

# Comando por defecto para iniciar nginx
CMD ["nginx", "-g", "daemon off;"]
