-- Crear la base de datos
CREATE DATABASE SW_PARCIAL;

-- Crear la tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  correo VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL
);

-- Crear la tabla de salas
CREATE TABLE IF NOT EXISTS salas (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  diagram JSON  NULL,
  is_active BOOLEAN DEFAULT TRUE
  user_create INTEGER REFERENCES users(id) ON DELETE SET NULL
);

-- Crear la tabla intermedia para la relación muchos a muchos
CREATE TABLE IF NOT EXISTS users_sala (
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  sala_id INTEGER REFERENCES salas(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT TRUE
  PRIMARY KEY (user_id, sala_id)
);

CREATE TABLE IF NOT EXISTS session (
  sid VARCHAR PRIMARY KEY,
  sess JSON NOT NULL,
  expire TIMESTAMP NOT NULL
);

SELECT * FROM SALAS
SELECT * FROM USERS

