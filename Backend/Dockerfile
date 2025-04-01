# Usamos la imagen oficial de Python
FROM python

# Establecer el directorio de trabajo
WORKDIR /app

# Copiar los archivos de la aplicación
COPY requirements.txt /app/

# Instalar las dependencias
RUN pip install --no-cache-dir -r requirements.txt

# Copiar el resto del código de la aplicación
COPY . /app/

# Exponer el puerto donde se ejecuta Flask
EXPOSE 5000

# Comando para correr la aplicación
CMD ["python", "app.py"]
