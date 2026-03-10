CREATE TABLE clientes (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    apellido VARCHAR(50) NOT NULL,
    celular VARCHAR(20),
    correo VARCHAR(100) UNIQUE, 
    puntos INTEGER DEFAULT 0,
    fecha_nacimiento DATE,      
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);