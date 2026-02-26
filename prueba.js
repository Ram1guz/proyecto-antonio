const { Client } = require('pg');
const client = new Client({
  user: 'ramiro',
  host: '127.0.0.1',
  database: 'jacaqu_rewards',
  password: '5262',
  port: 5432,
});
client.connect()
  .then(() => {
    console.log("✅ CONEXIÓN EXITOSA DESDE NODE!");
    process.exit();
  })
  .catch(err => console.error("❌ ERROR DE CONEXIÓN:", err.stack));