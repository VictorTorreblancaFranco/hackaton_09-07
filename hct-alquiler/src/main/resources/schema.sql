CREATE TABLE IF NOT EXISTS alquileres (
    id BIGSERIAL PRIMARY KEY,
    cliente_id BIGINT NOT NULL,
    vehiculo_id BIGINT NOT NULL,
    dias INTEGER NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    total NUMERIC(10,2) NOT NULL,
    estado VARCHAR(20) NOT NULL
);

