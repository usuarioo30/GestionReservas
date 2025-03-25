const BASE_URL_LOGIN = 'https://api-adiscovery.apeiroo.com/api';
document.getElementById('loginForm').addEventListener('submit', async function (e) {
    e.preventDefault(); // Evitar el envío del formulario

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    if (!email || !password) {
        showNotification("warning", "Por favor, ingresa tu correo y contraseña.");
        return;
    }

    try {
        const response = await fetch(`${BASE_URL_LOGIN}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        console.log("HTTP Status:", response.status); // 👀 Verificar código de respuesta

        const data = await response.json(); // Parsear la respuesta JSON
        console.log("API Response:", data); // 👀 Ver qué responde el backend

        if (response.ok) {
            // Guardar autenticación en cookies/localStorage
            document.cookie = `auth=loggedIn; path=/; max-age=3600`;
            localStorage.setItem('userEmail', email);
            localStorage.setItem('userRole', data.role);
            showNotification("success", data.message);

            setTimeout(() => {
                window.location.href = "../leaks.html";
            }, 500);
        } else {
            let errorMessage = data.error || "Error al iniciar sesión.";

            if (response.status === 401) {
                errorMessage = "⚠️ Contraseña incorrecta. Inténtalo nuevamente.";
            } else if (response.status === 404) {
                errorMessage = "⚠️ El usuario no existe. Verifica tu correo.";
            } else if (response.status === 400) {
                errorMessage = "⚠️ Email y contraseña son obligatorios.";
            }

            // Notificación de error
            showNotification("error", errorMessage);
        }
    } catch (error) {
        console.error("❌ Error en la solicitud de login:", error);
        showNotification("error", "No se pudo conectar con el servidor. Revisa tu conexión a internet.");
    }
});

// Manejar el login con Google
function handleCredentialResponse(response) {
    const responsePayload = decodeJwtResponse(response.credential);

    console.log("Email autenticado con Google:", responsePayload.email);

    // Enviar el email al backend para verificar si existe en la DB
    fetch(`${BASE_URL_LOGIN}/google-login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: responsePayload.email })
    })
    .then(res => res.json())
    .then(data => {
        if (data.exists) {
            // Guardar sesión si el usuario existe
            document.cookie = `auth=loggedIn; path=/; max-age=3600`;
            localStorage.setItem('userEmail', responsePayload.email);
            localStorage.setItem('userRole', data.role);
            showNotification("success", data.message);

            setTimeout(() => {
                window.location.href = "../leaks.html";
            }, 500);
        } else {
            showNotification("error", "El correo no esta registrado. Contacta con soporte.");
        }
    })
    .catch(error => {
        console.error("Error en el login con Google:", error);
        showNotification("error", "Hubo un problema al intentar iniciar sesión con Google.");
    });
}

// Función para mostrar alertas bonitas con SweetAlert2
function showNotification(type, message) {
    Swal.fire({
        icon: type, // "success", "error", "warning", "info"
        title: message,
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true
    });
}

// Función para decodificar JWT de Google
function decodeJwtResponse(token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}
