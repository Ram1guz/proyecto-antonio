 /// --- PROYECTO ANTONIO: LÓGICA DE CAFÉ REWARDS ---

// 1. Función para cambiar entre vistas
function showView(viewId) {
    console.log("Cambiando a la vista:", viewId);
    const views = ['view-register', 'view-client', 'view-barista'];
    
    views.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            if (id === viewId) {
                el.classList.remove('hidden');
            } else {
                el.classList.add('hidden');
            }
        }
    });
}

// 2. Esperar a que el DOM esté cargado
document.addEventListener('DOMContentLoaded', () => {
    console.log("🚀 Sistema Jacaqu Café cargado correctamente.");

    const formRegistro = document.getElementById('form-registro');

    if (formRegistro) {
        formRegistro.addEventListener('submit', async (e) => {
            e.preventDefault();
            console.log("📡 Enviando datos al servidor...");

            const datos = {
                nombre: document.getElementById('nombre').value,
                apellido: document.getElementById('apellido').value,
                celular: document.getElementById('celular').value,
                correo: document.getElementById('correo').value,
                fecha_nacimiento: document.getElementById('fecha_nacimiento').value
            };

            try {
                // Usamos la ruta relativa si el HTML se sirve desde el mismo servidor
                // o la IP fija 127.0.0.1 para evitar bloqueos
                const respuesta = await fetch('http://127.0.0.1:3000/registrar', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(datos)
                });

                if (!respuesta.ok) {
                    const errorData = await respuesta.json();
                    throw new Error(errorData.error || 'Error en el servidor');
                }

                const resultado = await respuesta.json();
                
                if (resultado.success) {
                    console.log("✅ Servidor respondió: Éxito");
                    alert('✅ ¡Registro exitoso en Café Rewards!');
                    formRegistro.reset();
                    
                    // Aquí puedes disparar la vista de puntos si quieres
                    // showView('view-client'); 
                }
            } catch (error) {
                console.error("❌ Error en la petición:", error);
                alert('⚠️ No se pudo conectar con el servidor Jacaqu. Asegúrate de que Node.js esté corriendo.');
            }
        });
    }

    // 4. Lógica para el botón "Limpiar / Siguiente"
    const btnLimpiar = document.querySelector('.btn-limpiar');
    if (btnLimpiar) {
        btnLimpiar.addEventListener('click', () => {
            if(formRegistro) formRegistro.reset();
            const displayPuntos = document.getElementById('current-points');
            if (displayPuntos) displayPuntos.innerText = "0";
            console.log("🧹 Formulario limpio.");
        });
    }
});