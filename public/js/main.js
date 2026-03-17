// ==========================================
// VARIABLES GLOBALES
// ==========================================
let clienteActual = null;

// ==========================================
// 1. REGISTRAR (Guarda en la DB Real)
// ==========================================
document.getElementById('form-registro').addEventListener('submit', async function(e) {
    e.preventDefault();

    const datos = {
        nombre: document.getElementById('nombre').value.trim(),
        apellido: document.getElementById('apellido').value.trim(),
        celular: document.getElementById('celular').value.trim(),
        correo: document.getElementById('correo').value.trim(),
        fecha_nacimiento: document.getElementById('fecha_nacimiento').value
    };

    try {
        const respuesta = await fetch('/registro', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        });

        if (respuesta.ok) {
            const clienteGuardado = await respuesta.json();
            alert(`✅ ¡${clienteGuardado.nombre} registrado con éxito!`);
            seleccionarCliente(clienteGuardado);
        } else {
            // Mensaje inteligente: si no es OK, es que el CONSTRAINT que pusimos en DBeaver saltó
            alert("⚠️ El cliente ya existe o los datos coinciden con un registro actual.");
        }
    } catch (err) {
        console.error("Error de conexión:", err);
        alert("🔌 Error de conexión con el servidor.");
    }
});

// ==========================================
// 2. BUSCAR (En PostgreSQL)
// ==========================================
document.getElementById('btn-buscar').addEventListener('click', async () => {
    const nombre = document.getElementById('nombre').value.trim();
    const apellido = document.getElementById('apellido').value.trim();

    if (!nombre || !apellido) {
        alert("Ingresa nombre y apellido para buscar.");
        return;
    }

    console.log(`🔎 Buscando a: ${nombre} ${apellido}...`);

    try {
        const respuesta = await fetch(`/buscar?nombre=${nombre}&apellido=${apellido}`);
        
        if (respuesta.ok) {
            const cliente = await respuesta.json();
            console.log("📦 Datos brutos recibidos del servidor:", cliente);
            seleccionarCliente(cliente);
        } else {
            console.warn("⚠️ Servidor respondió con error (Posible 404)");
            mostrarError("❌ Cliente no encontrado.");
        }
    } catch (err) {
        console.error("🚨 Error crítico en la búsqueda:", err);
        mostrarError("🔌 Error de red.");
    }
});

// ==========================================
// 3. SUMAR PUNTOS
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
// 4. FUNCIONES DE INTERFAZ
// ==========================================
function seleccionarCliente(cliente) {
    console.log("✅ Datos que llegaron al JS:", cliente);
    clienteActual = cliente;
    
    // 1. Nombre y Apellido (Este sí te funcionaba)
    const nombreElemento = document.getElementById('display-nombre-cliente');
    if (nombreElemento) {
        nombreElemento.innerText = `Cliente: ${cliente.nombre} ${cliente.apellido}`;
    }

    // 2. Celular
    const celElemento = document.getElementById('display-celular');
    if (celElemento) {
        // Probamos con 'celular' y 'cel' por si acaso
        celElemento.innerText = `📱 Celular: ${cliente.celular || cliente.cel || '---'}`;
    }

    // 3. Correo
    const correoElemento = document.getElementById('display-correo');
    if (correoElemento) {
        // Probamos con 'correo' y 'email'
        correoElemento.innerText = `📧 Correo: ${cliente.correo || cliente.email || '---'}`;
    }
    
    // 4. Fecha de Nacimiento
    const fechaElemento = document.getElementById('display-fecha');
    if (fechaElemento) {
        // Usamos el nombre exacto que confirmaste en DBeaver
        const valorFecha = cliente.fecha_nacimiento;
        if (valorFecha) {
            const fechaObj = new Date(valorFecha);
            const fechaFormateada = fechaObj.toLocaleDateString('es-ES', { timeZone: 'UTC' });
            fechaElemento.innerText = `🎂 Cumpleaños: ${fechaFormateada}`;
        } else {
            fechaElemento.innerText = `🎂 Cumpleaños: ---`;
        }
    }

    // 5. Puntos y QR
    document.getElementById('current-points').innerText = cliente.puntos || 0;
    document.getElementById('btn-add-point').style.display = 'block';
    
    if (cliente.id) {
        generarQR(cliente.id.toString());
    }
}
document.getElementById('btn-limpiar').addEventListener('click', () => {
    clienteActual = null;
    document.getElementById('form-registro').reset();
    document.getElementById('display-nombre-cliente').innerText = "Esperando selección...";
    document.getElementById('display-nombre-cliente').style.color = "#18405c";
    
    document.getElementById('display-celular').innerText = "";
    document.getElementById('display-correo').innerText = "";
    document.getElementById('display-fecha').innerText = "";

    document.getElementById('current-points').innerText = "0";
    document.getElementById('btn-add-point').style.display = 'none';
    document.getElementById('qrcode').innerHTML = "";
});

function mostrarError(mensaje) {
    clienteActual = null;
    const display = document.getElementById('display-nombre-cliente');
    display.innerText = mensaje;
    display.style.color = "red";
    
    // Limpiar restos de búsquedas anteriores
    document.getElementById('display-celular').innerText = "";
    document.getElementById('display-correo').innerText = "";
    document.getElementById('display-fecha').innerText = "";
    document.getElementById('current-points').innerText = "0";
    document.getElementById('btn-add-point').style.display = 'none';
    document.getElementById('qrcode').innerHTML = "";
}