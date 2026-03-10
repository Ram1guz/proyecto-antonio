let clienteActual = null;

// ==========================================
// 1. REGISTRAR (Ahora guarda en la DB Real)
// ==========================================
document.getElementById('form-registro').addEventListener('submit', async function(e) {
    e.preventDefault();

    const datos = {
    nombre: document.getElementById('nombre').value.trim(),
    apellido: document.getElementById('apellido').value.trim(),
    celular: document.getElementById('celular').value.trim(),
    correo: document.getElementById('correo').value.trim(),
    fecha_nacimiento: document.getElementById('fecha_nacimiento').value // <-- Nuevo!
};

    try {
        const respuesta = await fetch('/registro', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        });

        if (respuesta.ok) {
            const clienteGuardado = await respuesta.json();
            alert(`✅ ¡${clienteGuardado.nombre} registrado en la base de datos!`);
            seleccionarCliente(clienteGuardado);
        } else {
            alert("❌ Error al registrar. Quizás el correo ya existe.");
        }
    } catch (err) {
        console.error("Error de conexión:", err);
        alert("🔌 No se pudo conectar con el servidor.");
    }
});

// ==========================================
// 2. BUSCAR (Busca en PostgreSQL)
// ==========================================
// Vinculamos el botón de buscar manualmente ya que quitamos el onclick del HTML
document.getElementById('btn-buscar').addEventListener('click', async () => {
    const nombre = document.getElementById('nombre').value.trim();
    const apellido = document.getElementById('apellido').value.trim();

    if (!nombre || !apellido) {
        alert("Ingresa nombre y apellido para buscar.");
        return;
    }

    try {
        const respuesta = await fetch(`/buscar?nombre=${nombre}&apellido=${apellido}`);
        if (respuesta.ok) {
            const cliente = await respuesta.json();
            seleccionarCliente(cliente);
        } else {
            mostrarError("❌ Cliente no encontrado en Jacaqu Café.");
        }
    } catch (err) {
        mostrarError("🔌 Error de conexión al buscar.");
    }
});

// ==========================================
// 3. SUMAR PUNTO (Actualiza la DB)
// ==========================================
document.getElementById('btn-add-point').addEventListener('click', async () => {
    if (!clienteActual) return;

    try {
        const respuesta = await fetch('/sumar-punto', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: clienteActual.id })
        });

        if (respuesta.ok) {
            const datosActualizados = await respuesta.json();
            clienteActual.puntos = datosActualizados.puntos;
            document.getElementById('current-points').innerText = clienteActual.puntos;
            
            // Feedback visual
            const display = document.getElementById('display-nombre-cliente');
            display.innerText = `¡Punto añadido! Total: ${clienteActual.puntos}`;
            setTimeout(() => {
                display.innerText = `Cliente: ${clienteActual.nombre} ${clienteActual.apellido}`;
            }, 2000);
        }
    } catch (err) {
        alert("Error al sumar punto.");
    }
});

// ==========================================
// 4. FUNCIONES DE INTERFAZ (Se mantienen igual)
// ==========================================
function seleccionarCliente(cliente) {
    clienteActual = cliente;
    document.getElementById('display-nombre-cliente').innerText = `Cliente: ${cliente.nombre} ${cliente.apellido}`;
    document.getElementById('display-nombre-cliente').style.color = "#18405c";
    document.getElementById('current-points').innerText = cliente.puntos;
    document.getElementById('btn-add-point').style.display = 'block';
    generarQR(cliente.id.toString(), `${cliente.nombre} ${cliente.apellido}`);
}

function generarQR(id, nombre) {
    const contenedorQR = document.getElementById('qrcode');
    contenedorQR.innerHTML = ""; 
    const qrDiv = document.createElement("div");
    contenedorQR.appendChild(qrDiv);
    
    new QRCode(qrDiv, {
        text: id, // El QR ahora contiene el ID real de la base de datos
        width: 150,
        height: 150,
        colorDark : "#18405c"
    });
}

document.getElementById('btn-limpiar').addEventListener('click', () => {
    clienteActual = null;
    document.getElementById('form-registro').reset();
    document.getElementById('display-nombre-cliente').innerText = "Esperando cliente...";
    document.getElementById('current-points').innerText = "0";
    document.getElementById('btn-add-point').style.display = 'none';
    document.getElementById('qrcode').innerHTML = "";
});

function mostrarError(mensaje) {
    clienteActual = null;
    const display = document.getElementById('display-nombre-cliente');
    display.innerText = mensaje;
    display.style.color = "red";
    document.getElementById('current-points').innerText = "0";
    document.getElementById('btn-add-point').style.display = 'none';
}