CREATE TABLE IF NOT EXISTS vehiculos (
    id BIGSERIAL PRIMARY KEY,
    placa VARCHAR(10) NOT NULL,
    marca VARCHAR(80) NOT NULL,
    modelo VARCHAR(80) NOT NULL,
    anio INTEGER NOT NULL,
    color VARCHAR(40) NOT NULL,
    precio_por_dia NUMERIC(10,2) NOT NULL,
    estado VARCHAR(20) NOT NULL
);

