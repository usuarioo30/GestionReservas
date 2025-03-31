# Paso 1: Construir la aplicación Angular
FROM node:22.14.0-slim AS build

WORKDIR /app

# Copiamos el package.json y package-lock.json
COPY package.json package-lock.json ./

# Instalamos las dependencias
RUN npm install

# Copiamos el código de la aplicación Angular
COPY . .

# Creamos la versión de producción de la aplicación Angular
RUN npm run build --prod  # El comando que genera los archivos estáticos de la aplicación

# Paso 2: Configurar Nginx para servir los archivos estáticos de Angular
FROM nginx:alpine

# Copiamos los archivos de la aplicación Angular desde el contenedor de construcción
COPY --from=build /app/dist/frontend-angular /usr/share/nginx/html

# Copiamos un archivo de configuración personalizado de Nginx si lo tienes
# Puedes personalizar la configuración de Nginx (esto es opcional)
COPY nginx.conf /etc/nginx/nginx.conf

# Exponemos el puerto 80, que es el puerto por defecto de Nginx
EXPOSE 80

# Comando para ejecutar Nginx
CMD ["nginx", "-g", "daemon off;"]
