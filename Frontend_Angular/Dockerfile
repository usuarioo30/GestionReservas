# Usamos la imagen oficial de Node.js
FROM node:16-slim

# Establecemos el directorio de trabajo
WORKDIR /app

# Copiamos el package.json y el package-lock.json
COPY package.json package-lock.json ./

# Instalamos las dependencias
RUN npm install

# Copiamos el código de la aplicación Angular al contenedor
COPY . .

# Exponemos el puerto 80, ya que Angular debe escuchar en el puerto 80
EXPOSE 80

# Comando para iniciar la aplicación Angular
CMD ["npm", "start"]  # Esto ejecutará el servidor de desarrollo de Angular en el puerto 80