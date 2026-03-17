const express = require('express');
const { Pool } = require('pg');
const path = require('path');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Evitar caché para ver cambios en tiempo real
app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    next();
});

// Archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// ==========================================
// CONFIGURACIÓN DE POSTGRESQL (Ajustada para Docker)
// ==========================================
const pool = new Pool({
    user: process.env.DB_USER || 'ramiro',
    host: process.env.DB_HOST || 'db', 
    database: process.env.DB_NAME || 'jacaqu_rewards',
    password: process.env.DB_PASSWORD || '5262', 
    port: 5432,
});

pool.connect((err, client, release) => {
    if (err) {
        return console.error('❌ Error conectando a PostgreSQL desde Node:', err.stack);
    }
    console.log('🐘 Conectado a PostgreSQL exitosamente desde el contenedor');
    release();
});

// ==========================================
// API: Registrar Cliente (Coincide con main.js)
// ==========================================
app.post('/registro', async (req, res) => {
    const { nombre, apellido, celular, correo, fecha_nacimiento } = req.body;

    // 1. Validación de campos vacíos
    if (!nombre || !apellido || !celular || !correo || !fecha_nacimiento) {
        return res.status(400).json({ error: "Faltan datos obligatorios para el registro." });
    }

    try {
        const query = `
            INSERT INTO clientes (nombre, apellido, celular, correo, puntos, fecha_nacimiento)
            VALUES ($1, $2, $3, $4, 0, $5) RETURNING *`;
        
        const values = [nombre, apellido, celular, correo, fecha_nacimiento];
        const resultado = await pool.query(query, values);

        res.status(201).json(resultado.rows[0]);
    } catch (err) {
        console.error("❌ Error en DB:", err.message);
        
        // 2. Validación de duplicados (Celular o Correo)
        if (err.code === '23505') {
            res.status(400).json({ error: "El celular o el correo ya están registrados en el sistema." });
        } else {
            res.status(500).json({ error: "Hubo un problema técnico al guardar. Intenta de nuevo." });
        }
    }
});

// ==========================================
// API: Buscar Cliente (Coincide con main.js)
// ==========================================
app.get('/buscar', async (req, res) => {
    // Extraemos los datos que vienen de la URL
    const { nombre, apellido } = req.query;

    try {
        // 1. La consulta SQL con el SELECT * para traer TODO
        const query = 'SELECT * FROM clientes WHERE nombre = $1 AND apellido = $2';
        const result = await pool.query(query, [nombre, apellido]);

        // 2. Verificamos si encontramos a alguien
        if (result.rows.length > 0) {
            console.log("✅ Cliente encontrado:", result.rows[0]);
            res.json(result.rows[0]); // Enviamos toda la fila al frontend
        } else {
            console.log("❓ Cliente no existe en la DB");
            res.status(404).json({ error: 'Cliente no encontrado' });
        }
    } catch (err) {
        console.error("🚨 Error en la consulta SQL:", err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// ==========================================
// API: Sumar Punto
// ==========================================
app.post('/sumar-punto', async (req, res) => {
    const { id } = req.body;
    try {
        const query = 'UPDATE clientes SET puntos = puntos + 1 WHERE id = $1 RETURNING *';
        const resultado = await pool.query(query, [id]);
        res.json({ success: true, puntos: resultado.rows[0].puntos });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Iniciar servidor - Escuchando en 0.0.0.0 para que Docker lo vea
const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor Jacaqu Café listo en puerto ${PORT}`);
});