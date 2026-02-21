CREATE DATABASE jacaqu_rewards;
\c jacaqu_rewards; -- Esto te conecta a la nueva base de datos

CREATE TABLE clientes (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    apellido VARCHAR(50) NOT NULL,
    celular VARCHAR(20) UNIQUE NOT NULL,
    correo VARCHAR(100),
    fecha_nacimiento DATE,
    puntos INTEGER DEFAULT 0,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
); 