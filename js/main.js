 let clienteActual = null;
let html5QrCode = null;

// --- 1. REGISTRAR ---
document.getElementById('form-cliente').addEventListener('submit', function(e) {
    e.preventDefault();
    const nom = document.getElementById("nombre").value.trim();
    const ape = document.getElementById("apellido").value.trim();
    
    clienteActual = {
        nombre: nom,
        apellido: ape,
        celular: document.getElementById("celular").value,
        correo: document.getElementById("correo").value,
        puntos: 0
    };

    guardarEnLocalStorage();
    actualizarInterfaz();
    alert("✅ Cliente registrado");
    this.reset();
});

// --- 2. BUSCAR MANUAL ---
window.buscarCliente = function() {
    const nom = document.getElementById("nombre").value.trim();
    const ape = document.getElementById("apellido").value.trim();
    const llave = (nom + ape).toLowerCase().replace(/\s+/g, '');
    
    const datos = localStorage.getItem(llave);
    if (datos) {
        clienteActual = JSON.parse(datos);
        actualizarInterfaz();
    } else {
        alert("❌ Cliente no encontrado");
    }
};

// --- 3. LÓGICA QR (GENERAR Y ESCANEAR) ---

window.activarEscaner = function() {
    document.getElementById("reader-container").style.display = "block";
    html5QrCode = new Html5Qrcode("reader");
    
    const config = { fps: 10, qrbox: { width: 250, height: 250 } };
    
    html5QrCode.start(
        { facingMode: "user" }, 
        config,
        (decodedText) => { // Éxito
            const datos = localStorage.getItem(decodedText);
            if (datos) {
                clienteActual = JSON.parse(datos);
                actualizarInterfaz();
                detenerEscaner();
                alert("✅ Cliente cargado");
            } else {
                alert("QR no reconocido");
            }
        }
    ).catch(err => alert("Error al abrir cámara: " + err));
};

window.detenerEscaner = function() {
    if (html5QrCode) {
        html5QrCode.stop().then(() => {
            document.getElementById("reader-container").style.display = "none";
        });
    }
};

// --- 4. ACTUALIZAR INTERFAZ ---
function actualizarInterfaz() {
    const contenedor = document.getElementById("lista-clientes-container");
    if (!clienteActual) return;

    const llave = (clienteActual.nombre + clienteActual.apellido).toLowerCase().replace(/\s+/g, '');
    const urlQR = `https://chart.googleapis.com/chart?chs=150x150&cht=qr&chl=${llave}`;

    contenedor.innerHTML = `
        <div class="card">
            <span id="displayNombre">${clienteActual.nombre} ${clienteActual.apellido}</span>
            <div class="puntos-display">${clienteActual.puntos}</div>
            <p>CAFÉS ACUMULADOS</p>
            
            <div class="button-group">
                <button onclick="sumarPunto()" class="btn-nuevo">➕ Sumar</button>
                <button onclick="canjear()" class="${clienteActual.puntos >= 10 ? 'btn-buscar' : 'btn-accion-off'}">🎁 Canjear</button>
            </div>

            <div class="qr-card">
                <img src="${urlQR}" alt="QR Cliente">
                <p style="font-size: 0.7rem; color: #666;">ID: ${llave}</p>
            </div>
        </div>
    `;
}

// --- 5. FUNCIONES DE APOYO ---
window.sumarPunto = function() {
    if (clienteActual && clienteActual.puntos < 10) {
        clienteActual.puntos++;
        guardarEnLocalStorage();
        actualizarInterfaz();
    }
};

window.canjear = function() {
    if (clienteActual.puntos >= 10) {
        clienteActual.puntos = 0;
        guardarEnLocalStorage();
        actualizarInterfaz();
        alert("✨ ¡Premio entregado!");
    }
};

window.limpiarPantalla = function() {
    clienteActual = null;
    document.getElementById("form-cliente").reset();
    document.getElementById("lista-clientes-container").innerHTML = "";
};

function guardarEnLocalStorage() {
    const llave = (clienteActual.nombre + clienteActual.apellido).toLowerCase().replace(/\s+/g, '');
    localStorage.setItem(llave, JSON.stringify(clienteActual));
}