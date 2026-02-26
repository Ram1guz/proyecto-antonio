const express = require('express');
const { Pool } = require('pg');
const path = require('path');
const cors = require('cors'); // Agregamos esto para evitar errores de conexión
const app = express();

// Middleware
app.use(cors()); // Permitir conexiones de cualquier origen
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Evitar caché
app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    next();
});

// Archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Configuración de PostgreSQL
const pool = new Pool({
    user: 'ramiro',
    host: '127.0.0.1', // Forzamos IP local
    database: 'jacaqu_rewards',
    password: '5262', 
    port: 5432,
});

// Probar conexión a la DB al iniciar
pool.connect((err, client, release) => {
    if (err) {
        return console.error('❌ Error conectando a PostgreSQL:', err.stack);
    }
    console.log('🐘 Conectado a PostgreSQL exitosamente');
    release();
});

// Ruta principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API: Ver clientes
app.get('/admin/clientes', async (req, res) => {
    try {
        const resultado = await pool.query('SELECT * FROM clientes ORDER BY fecha_registro DESC');
        res.json(resultado.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// API: Registrar Cliente
app.post('/registrar', async (req, res) => {
    const { nombre, apellido, celular, correo, fecha_nacimiento } = req.body;

    try {
        // 1. Validar si ya existe
        const existe = await pool.query('SELECT * FROM clientes WHERE celular = $1', [celular]);
        if (existe.rows.length > 0) {
            return res.status(400).json({ success: false, error: "Este celular ya está registrado." });
        }

        // 2. Insertar (con fecha_nacimiento que ya comprobamos que existe en la DB)
        const query = `
            INSERT INTO clientes (nombre, apellido, celular, correo, puntos, fecha_nacimiento)
            VALUES ($1, $2, $3, $4, 0, $5) RETURNING *`;
        
        const values = [nombre, apellido, celular, correo, fecha_nacimiento || null];
        const resultado = await pool.query(query, values);

        console.log("✅ Cliente registrado:", resultado.rows[0].nombre);
        res.status(201).json({ success: true, cliente: resultado.rows[0] });

    } catch (err) {
        console.error("❌ Error en Registro:", err.message);
        res.status(500).json({ success: false, error: "Error en la base de datos: " + err.message });
    }
});

// Iniciar servidor con manejo de errores
const PORT = 3000;
const server = app.listen(PORT, '127.0.0.1', () => {
    console.log(`🚀 Servidor real lanzado en: http://127.0.0.1:${PORT}`);
});

server.on('error', (e) => {
    if (e.code === 'EADDRINUSE') {
        console.error(`❌ El puerto ${PORT} está ocupado. CIERRA EL OTRO TERMINAL o usa 'killall -9 node'`);
    } else {
        console.error("❌ Error inesperado:", e);
    }
});