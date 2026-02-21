-- 1. Buscar un cliente por celular (para cuando lleguen a la caja)
SELECT * FROM clientes WHERE celular = '123456789';

-- 2. Sumar puntos a un cliente (ej. compró un café, +10 puntos)
UPDATE clientes SET puntos = puntos + 10 WHERE id = 1;

-- 3. Ver el Top 5 de clientes con más puntos (¡Tus clientes VIP!)
SELECT nombre, apellido, puntos FROM clientes ORDER BY puntos DESC LIMIT 5;
