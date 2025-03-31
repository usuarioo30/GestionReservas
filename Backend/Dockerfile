# Usamos la imagen oficial de Python
FROM python

# Establecemos el directorio de trabajo
WORKDIR /app

# Copiamos el archivo requirements.txt y lo instalamos
COPY requirements.txt .

# Instalamos las dependencias
RUN pip install --no-cache-dir -r requirements.txt

# Copiamos el código de la aplicación al contenedor
COPY . .

# Expón el puerto donde tu aplicación escucha
EXPOSE 5000

# Comando para ejecutar la aplicación (ajusta esto si usas otro framework)
CMD ["python", "app.py"]