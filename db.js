const { Pool } = require('pg');

// Configuración del Pool usando variables de entorno para Docker
const pool = new Pool({
    user: process.env.DB_USER || 'ramiro',
    host: process.env.DB_HOST || 'localhost', 
    database: process.env.DB_NAME || 'jacaqu_rewards',
    password: process.env.DB_PASSWORD || 'tu_password_seguro',
    port: 5432,
});

// Prueba de conexión inmediata
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('❌ Error conectando a la base de datos:', err.stack);
    } else {
        console.log('✅ Conexión exitosa a PostgreSQL (Docker DB)');
    }
});

module.exports = pool;
