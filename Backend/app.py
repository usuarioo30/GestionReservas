from flask import Flask, request, jsonify
from datetime import timedelta, datetime

import google.auth
import google.auth.transport.requests
from flask import Flask, request, jsonify
from flask_cors import CORS  # Importa Flask-CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.exc import IntegrityError
from werkzeug.security import generate_password_hash

# Configuración de la base de datos y otros parámetros
class Config:
    SQLALCHEMY_DATABASE_URI = 'mysql://root:Usuario1234@localhost/gestionreservas'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SECRET_KEY = 'miClave'  # Clave secreta para JWT
    JWT_SECRET_KEY = 'mi_secreto_jwt'  # Clave secreta para JWT

# Inicializa la base de datos y JWT
db = SQLAlchemy()
jwt = JWTManager()

# Definir el modelo de Usuario
class Usuario(db.Model):
    __tablename__ = 'usuario'

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    username = db.Column(db.String(120), nullable=False)
    roles = db.Column(db.String(255), nullable=False)

    def __repr__(self):
        return f'<Usuario {self.username}>'

class Reserva(db.Model):
    __tablename__ = 'reserva'

    id = db.Column(db.Integer, primary_key=True)
    sala = db.Column(db.String(120), nullable=False)
    fechaHoraInicio = db.Column(db.DateTime, nullable=False)
    duracion = db.Column(db.Integer, nullable=False)
    proyectoAsociado = db.Column(db.String(120), nullable=False)
    descripcion = db.Column(db.String(255), nullable=False)
    idUsuario = db.Column(db.Integer, db.ForeignKey('usuario.id'), nullable=False)

    def __repr__(self):
        return f'<Reserva {self.sala}>'

# Función para crear la aplicación
def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Inicializa SQLAlchemy y JWT con la aplicación
    db.init_app(app)
    jwt.init_app(app)

    # Habilita CORS para todas las rutas
    CORS(app, resources={r"/*": {"origins": "http://localhost:4200"}})

    return app

app = create_app()

# Ruta para el inicio de sesión con credenciales propias (usuario y contraseña)
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    # Buscar el usuario en la base de datos
    usuario = Usuario.query.filter_by(username=username).first()
    
    if usuario and usuario.password == password:
        access_token = create_access_token( identity=usuario.id,  # El ID del usuario como identidad
            additional_claims={  # Aquí agregamos más información
                "nombre": usuario.username,
                "email": usuario.email,
            })
        return jsonify(access_token=access_token), 200
    else:
        return jsonify({"message": "Credenciales incorrectas"}), 401

# Ruta para el inicio de sesión con Google
@app.route('/login/google', methods=['POST'])
def google_login():
    # El flujo de OAuth 2.0 se crea y autentica a través de Google
    data = request.get_json()
    token_id = data.get('id_token')  # id_token que Google devuelve

    try:
        # Verifica el token con Google
        credentials = google.auth.credentials.Credentials.from_authorized_user_info(info=token_id)
        request_info = google.auth.transport.requests.Request()

        id_info = google.oauth2.id_token.verify_oauth2_token(token_id, request_info)
        if id_info['iss'] != 'accounts.google.com' and id_info['iss'] != 'https://accounts.google.com':
            raise ValueError('Token de autenticación inválido.')

        # Verificar que el correo sea del dominio de la empresa
        if not id_info['email'].endswith('@apeiroo.com'):
            return jsonify({'message': 'No autorizado'}), 403

        # Crear el token JWT
        usuario = Usuario.query.filter_by(email=id_info['email']).first()
        if not usuario:
            usuario = Usuario(email=id_info['email'], username=id_info['username'], password=None)
            db.session.add(usuario)
            db.session.commit()

        access_token = create_access_token(identity=usuario.id, expires_delta=timedelta(hours=1))
        return jsonify(access_token=access_token), 200

    except Exception as e:
        return jsonify({'message': 'Autenticación fallida', 'error': str(e)}), 401

# Ruta protegida que requiere JWT para acceder
@app.route('/dashboard', methods=['GET'])
@jwt_required()
def dashboard():
    usuarioActual = get_jwt_identity()
    return jsonify(logged_in_as=usuarioActual), 200

# Ruta para registrar una reserva
@app.route('/registrarReserva', methods=['POST'])
# @jwt_required()
def registrar_reserva():
    try:
        # Obtener los datos de la reserva desde el cuerpo de la solicitud
        data = request.get_json()
        sala = data.get('sala')
        fechaHoraInicio = data.get('fechaHoraInicio')
        duracion = data.get('duracion')
        proyectoAsociado = data.get('proyectoAsociado')
        descripcion = data.get('descripcion')
        idUsuario = data.get('idUsuario')

        # Validar si los campos necesarios están presentes
        if not all([sala, fechaHoraInicio, duracion, proyectoAsociado, descripcion]):
            return jsonify({"message": "Todos los campos son obligatorios"}), 400

        # Convertir la fecha y hora de inicio a un objeto datetime
        try:
            fechaHoraInicio = datetime.strptime(fechaHoraInicio, '%Y-%m-%d %H:%M:%S')
        except ValueError:
            return jsonify({"message": "Formato de fecha y hora no válido. Use 'YYYY-MM-DD HH:MM:SS'."}), 400

        # Crear una nueva reserva
        nueva_reserva = Reserva(
            sala=sala,
            fechaHoraInicio=fechaHoraInicio,
            duracion=duracion,
            proyectoAsociado=proyectoAsociado,
            descripcion=descripcion,
            idUsuario=idUsuario
        )

        # Guardar la nueva reserva en la base de datos
        db.session.add(nueva_reserva)
        db.session.commit()

        return jsonify({"message": "Reserva creada con éxito"}), 201

    except Exception as e:
        # Manejo de errores generales
        return jsonify({"message": "Ocurrió un error al registrar la reserva", "error": str(e)}), 500

# Ruta para eliminar reserva
@app.route('/eliminarReserva/<int:id>', methods=['DELETE'])
def eliminarReserva(id):
    try:
        # Buscar la reserva por su ID
        reserva = Reserva.query.get(id)

        if reserva:
            # Eliminar la reserva
            db.session.delete(reserva)
            db.session.commit()
            return jsonify({"message": "Reserva eliminada con éxito"}), 200
        else:
            return jsonify({"message": "La reserva no existe"}), 404

    except Exception as e:
        return jsonify({"message": "Ocurrió un error al eliminar la reserva", "error": str(e)}), 500

# Ruta para editar una reserva
@app.route('/editarReserva/<int:id>', methods=['PUT'])
def editarReserva(id):
    try:
        # Buscar la reserva por su ID
        reserva = Reserva.query.get(id)

        if reserva:
            # Obtener los datos de la reserva desde el cuerpo de la solicitud
            data = request.get_json()
            sala = data.get('sala')
            fechaHoraInicio = data.get('fechaHoraInicio')
            duracion = data.get('duracion')
            proyectoAsociado = data.get('proyectoAsociado')
            descripcion = data.get('descripcion')
            idUsuario = data.get('idUsuario')

            # Actualizar los campos de la reserva
            if sala:
                reserva.sala = sala
            if fechaHoraInicio:
                reserva.fechaHoraInicio = fechaHoraInicio
            if duracion:
                reserva.duracion = duracion
            if proyectoAsociado:
                reserva.proyectoAsociado = proyectoAsociado
            if descripcion:
                reserva.descripcion = descripcion
            if idUsuario:
                reserva.idUsuario = idUsuario

            # Guardar los cambios en la base de datos
            db.session.commit()
            return jsonify({"message": "Reserva actualizada con éxito"}), 200

    except Exception as e:
        return jsonify({"message": "Reserva no encontrada", "error": str(e)}), 500

@app.route('/reservas', methods=['GET'])
def obtener_reservas():
    try:
        reservas = Reserva.query.all()
        reservas_serializadas = [
            {
                "id": reserva.id,
                "sala": reserva.sala,
                "fechaHoraInicio": reserva.fechaHoraInicio.strftime('%Y-%m-%d %H:%M:%S'),
                "duracion": reserva.duracion,
                "proyectoAsociado": reserva.proyectoAsociado,
                "descripcion": reserva.descripcion,
                "idUsuario": reserva.idUsuario
            }
            for reserva in reservas
        ]
        return jsonify(reservas_serializadas), 200
    except Exception as e:
        return jsonify({"message": "Error al obtener las reservas", "error": str(e)}), 500

# Obtener un usuario por su ID
@app.route('/usuarios/<int:id>', methods=['GET'])
def obtener_usuario_por_id(id):
    try:
        usuario = Usuario.query.get(id)
        usuario_serializado = {
            "id": usuario.id,
            "email": usuario.email,
            "username": usuario.username,
            "roles": usuario.roles 
        }
        return jsonify(usuario_serializado), 200
    except Exception as e:
        return jsonify({"message": "Error al obtener el usuario", "error": str(e)}), 500

# Crear un nuevo usuario
@app.route('/register', methods=['POST'])
@app.route('/register', methods=['POST'])
def crear_usuario():    
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        username = data.get('username')
        roles = data.get('roles')

        # Validar que todos los campos estén presentes
        if not all([email, password, username, roles]):
            return jsonify({"message": "Todos los campos son obligatorios"}), 400

        # Encriptar la contraseña
        password_hash = generate_password_hash(password)

        # Crear el nuevo usuario
        nuevo_usuario = Usuario(
            email=email,
            password=password_hash,
            username=username,
            roles=roles
        )

        db.session.add(nuevo_usuario)
        db.session.commit()

        return jsonify({"message": "Usuario creado con éxito"}), 201

    except IntegrityError as e:
        db.session.rollback()  # Revertir la transacción en caso de error
        if "Duplicate entry" in str(e.orig):
            return jsonify({"message": "El correo ya está registrado"}), 400
        return jsonify({"message": "Error de integridad en la base de datos", "error": str(e)}), 400

    except Exception as e:
        return jsonify({"message": "Error al crear el usuario", "error": str(e)}), 500

# Ejecutar la aplicación Flask
if __name__ == '__main__':
    # Crear la base de datos si no existe
    with app.app_context():
        db.create_all()

    # Ejecutar el servidor Flask
    app.run(debug=True)