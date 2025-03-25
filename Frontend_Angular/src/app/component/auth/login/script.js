function handleCredentialResponse(response) {
    if (!response.credential) {
        console.error("Error: No se recibió credencial de Google.");
        return;
    }

    const responsePayload = parseJwt(response.credential);

    console.log("ID Token: " + response.credential);
    console.log("ID: " + responsePayload.sub);
    console.log("Nombre Completo: " + responsePayload.name);
    console.log("Correo Electrónico: " + responsePayload.email);
    console.log("Imagen de Perfil: " + responsePayload.picture);

    // Mostrar la información del usuario en la página
    document.getElementById("user-info").innerHTML = `
        <h2>Bienvenido, ${responsePayload.name}</h2>
        <p><strong>Email:</strong> ${responsePayload.email}</p>
        <img src="${responsePayload.picture}" alt="Foto de perfil" width="100">
    `;
}

// Función para decodificar el token JWT de Google
function parseJwt(token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(
        atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join('')
    );

    return JSON.parse(jsonPayload);
}
