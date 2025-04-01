# Usamos una imagen oficial de Node.js para construir la aplicación Angular
FROM node:20.11.0 AS build

# Establecer el directorio de trabajo
WORKDIR /app

# Copiar los archivos de la aplicación Angular
COPY package*.json /app/

# Instalar las dependencias de Angular
RUN npm install

# Copiar el resto de la aplicación Angular
COPY . /app/

# Construir la aplicación para producción
RUN npm run build --prod

# Usamos la imagen oficial de Nginx para servir los archivos estáticos
FROM nginx:alpine

# Copiar los archivos construidos de Angular a la carpeta de Nginx
COPY --from=build /app/dist/frontend-angular /usr/share/nginx/html/

COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exponer el puerto 80 (default de Nginx)
EXPOSE 80

# Nginx corre por defecto, no es necesario un comando adicional