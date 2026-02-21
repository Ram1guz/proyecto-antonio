const express = require('express');
const { Pool } = require('pg');
const path = require('path');
const app = express();

// Middleware para leer datos de formularios (JSON y URL encoded)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos (aquí es donde vive tu HTML)
app.use(express.static('public'));

// Configuración de la conexión a PostgreSQL
const pool = new Pool({
    user: 'ramiro',
    host: 'localhost',
    database: 'jacaqu_rewards',
    password: 'tu_contraseña_aqui', // Pónle la contraseña que creamos antes
    port: 5432,
});

// --- RUTA PARA REGISTRAR CLIENTES ---
app.post('/registrar', async (req, res) => {
    const { nombre, apellido, celular, correo, fecha_nacimiento } = req.body;

    try {
        const query = `
            INSERT INTO clientes (nombre, apellido, celular, correo, fecha_nacimiento)
            VALUES ($1, $2, $3, $4, $5) RETURNING *`;
        
        const values = [nombre, apellido, celular, correo, fecha_nacimiento];
        const resultado = await pool.query(query, values);

        console.log("Cliente registrado:", resultado.rows[0]);
        
        // Al tener éxito, podrías enviar una respuesta o redirigir
        res.status(201).json({ success: true, cliente: resultado.rows[0] });

    } catch (err) {
        console.error("Error al registrar:", err.message);
        res.status(500).json({ success: false, error: "Error en la base de datos" });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor de Jacaqu Café corriendo en http://localhost:${PORT}`);
});