# Paso 1: Construir la aplicación Angular con Node.js v22.14.0
FROM node:22.14.0-slim AS build

# Establecer el directorio de trabajo
WORKDIR /app

# Copiar los archivos de package.json y package-lock.json
COPY package.json package-lock.json ./

# Instalar las dependencias
RUN npm install

# Copiar todo el código de la aplicación Angular
COPY . .

# Crear la versión de producción de la aplicación Angular
RUN npm run build --prod  # El comando que genera los archivos estáticos de la aplicación

# Paso 2: Configurar Nginx para servir los archivos estáticos de Angular
FROM nginx:alpine

# Copiar los archivos de la aplicación Angular desde el contenedor de construcción
COPY --from=build /app/dist/frontend-angular /usr/share/nginx/html

# Exponer el puerto 80 para que Nginx lo utilice
EXPOSE 80

# Comando para ejecutar Nginx (sin archivo de configuración personalizado)
CMD ["nginx", "-g", "daemon off;"]
