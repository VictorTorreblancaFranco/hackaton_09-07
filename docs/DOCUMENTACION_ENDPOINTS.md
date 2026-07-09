# Documentacion basica de endpoints

Sistema: alquiler de vehiculos.

Tecnologias:

- Java 26
- Spring Boot
- Spring WebFlux
- Spring Data R2DBC
- PostgreSQL Neon
- Lombok
- React para el frontend

## Como se conectan las partes

```text
Frontend React
http://localhost:5173
        |
        |-- Vehiculos  -> http://localhost:8081/api/vehiculos
        |-- Clientes   -> http://localhost:8082/api/clientes
        |-- Alquileres -> http://localhost:8083/api/alquileres
```

Cada microservicio tiene su propio puerto y su propio endpoint principal.
Todos se conectan a la misma base de datos PostgreSQL, pero cada uno usa su tabla:

- `vehiculos`
- `clientes`
- `alquileres`

La conexion a PostgreSQL se lee desde variables de entorno:

```text
DB_URL
DB_USERNAME
DB_PASSWORD
```

## Microservicio Vehiculo

Puerto:

```text
8081
```

Endpoint base:

```text
http://localhost:8081/api/vehiculos
```

Tabla:

```text
vehiculos
```

### GET /api/vehiculos

Lista todos los vehiculos registrados.

Respuesta ejemplo:

```json
[
  {
    "id": 1,
    "placa": "ABC-123",
    "marca": "Toyota",
    "modelo": "Corolla",
    "anio": 2026,
    "color": "Blanco",
    "precioPorDia": 150,
    "estado": "DISPONIBLE"
  }
]
```

### GET /api/vehiculos/{id}

Busca un vehiculo por su `id`.

Ejemplo:

```text
GET http://localhost:8081/api/vehiculos/1
```

Si existe, devuelve el vehiculo.
Si no existe, devuelve `404 Not Found`.

### POST /api/vehiculos

Crea un vehiculo nuevo.

Body:

```json
{
  "placa": "ABC-123",
  "marca": "Toyota",
  "modelo": "Corolla",
  "anio": 2026,
  "color": "Blanco",
  "precioPorDia": 150
}
```

El campo `estado` no se envia al crear. El sistema lo asigna automaticamente como `DISPONIBLE`.
El precio se muestra en el frontend con moneda peruana: `S/`.

Validaciones basicas:

- `placa`: obligatorio, formato `ABC-123`. Son 3 letras, guion y 3 numeros.
- `marca`: obligatorio.
- `modelo`: obligatorio.
- `anio`: obligatorio, minimo 2000.
- `color`: obligatorio, solo letras.
- `precioPorDia`: obligatorio, mayor o igual a 1.

### PUT /api/vehiculos/{id}

Actualiza un vehiculo existente.

Ejemplo:

```text
PUT http://localhost:8081/api/vehiculos/1
```

Body:

```json
{
  "placa": "ABC-123",
  "marca": "Toyota",
  "modelo": "Corolla",
  "anio": 2026,
  "color": "Negro",
  "precioPorDia": 180
}
```

### DELETE /api/vehiculos/{id}

Elimina un vehiculo por su `id`.

Ejemplo:

```text
DELETE http://localhost:8081/api/vehiculos/1
```

### PUT /api/vehiculos/{id}/estado?estado=FUERA_SERVICIO

Cambia el estado del vehiculo.

Ejemplos:

```text
PUT http://localhost:8081/api/vehiculos/1/estado?estado=FUERA_SERVICIO
PUT http://localhost:8081/api/vehiculos/1/estado?estado=DISPONIBLE
```

Uso basico:

- `DISPONIBLE`: el auto se puede alquilar.
- `EN_ALQUILER`: el sistema lo coloca cuando se registra un alquiler.
- `FUERA_SERVICIO`: el auto no se debe alquilar por mantenimiento u otro motivo.

Desde el frontend, estos estados se controlan desde la tabla de vehiculos.

## Microservicio Cliente

Puerto:

```text
8082
```

Endpoint base:

```text
http://localhost:8082/api/clientes
```

Tabla:

```text
clientes
```

### GET /api/clientes

Lista todos los clientes registrados.

Respuesta ejemplo:

```json
[
  {
    "id": 1,
    "dni": "72654321",
    "nombres": "Miguel Luis",
    "apellidos": "Lopez Sanchez",
    "celular": "987654321",
    "correo": "miguel@gmail.com",
    "licencia": "Q12345678",
    "estado": "ACTIVO"
  }
]
```

### GET /api/clientes/{id}

Busca un cliente por su `id`.

Ejemplo:

```text
GET http://localhost:8082/api/clientes/1
```

Si existe, devuelve el cliente.
Si no existe, devuelve `404 Not Found`.

### POST /api/clientes

Crea un cliente nuevo.

Body:

```json
{
  "dni": "72654321",
  "nombres": "Miguel Luis",
  "apellidos": "Lopez Sanchez",
  "celular": "987654321",
  "correo": "miguel@gmail.com",
  "licencia": "Q12345678"
}
```

El campo `estado` no se envia al crear. El sistema lo asigna automaticamente como `ACTIVO`.

Validaciones basicas:

- `dni`: obligatorio, exactamente 8 digitos.
- `nombres`: obligatorio.
- `apellidos`: obligatorio.
- `celular`: obligatorio, exactamente 9 digitos.
- `correo`: obligatorio, formato de correo.
- `licencia`: obligatorio.

### PUT /api/clientes/{id}

Actualiza un cliente existente.

Ejemplo:

```text
PUT http://localhost:8082/api/clientes/1
```

Body:

```json
{
  "dni": "72654321",
  "nombres": "Miguel Luis",
  "apellidos": "Lopez Sanchez",
  "celular": "999888777",
  "correo": "miguel@gmail.com",
  "licencia": "Q12345678"
}
```

### DELETE /api/clientes/{id}

Elimina un cliente por su `id`.

Ejemplo:

```text
DELETE http://localhost:8082/api/clientes/1
```

## Microservicio Alquiler

Puerto:

```text
8083
```

Endpoint base:

```text
http://localhost:8083/api/alquileres
```

Tabla:

```text
alquileres
```

Este es el microservicio transaccional porque registra la operacion de alquiler.
Usa `clienteId` y `vehiculoId` para relacionar el alquiler con un cliente y un vehiculo.
Cuando se crea un alquiler, el vehiculo pasa de `DISPONIBLE` a `EN_ALQUILER`.
Si un vehiculo esta en `EN_ALQUILER` o `FUERA_SERVICIO`, no se debe usar para un nuevo alquiler.

### GET /api/alquileres

Lista todos los alquileres registrados.

Respuesta ejemplo:

```json
[
  {
    "id": 1,
    "clienteId": 1,
    "vehiculoId": 1,
    "dias": 3,
    "fechaInicio": "2026-07-09",
    "fechaFin": "2026-07-12",
    "total": 720,
    "estado": "ACTIVO"
  }
]
```

### GET /api/alquileres/{id}

Busca un alquiler por su `id`.

Ejemplo:

```text
GET http://localhost:8083/api/alquileres/1
```

Si existe, devuelve el alquiler.
Si no existe, devuelve `404 Not Found`.

### POST /api/alquileres

Crea un alquiler nuevo.

Body:

```json
{
  "clienteId": 1,
  "vehiculoId": 1,
  "dias": 3,
  "fechaInicio": "2026-07-09",
  "fechaFin": "2026-07-12",
  "total": 720
}
```

El campo `estado` no se envia al crear. El sistema lo asigna automaticamente como `ACTIVO`.
El campo `total` se muestra en el frontend con moneda peruana: `S/`.
En el frontend, `fechaInicio` se carga por defecto con la fecha actual y se puede modificar.

Validaciones basicas:

- `clienteId`: obligatorio.
- `vehiculoId`: obligatorio.
- `dias`: obligatorio, minimo 1.
- `fechaInicio`: obligatorio.
- `fechaFin`: obligatorio.
- `total`: obligatorio, mayor o igual a 1.

### PUT /api/alquileres/{id}

Actualiza un alquiler existente.

Ejemplo:

```text
PUT http://localhost:8083/api/alquileres/1
```

Body:

```json
{
  "clienteId": 1,
  "vehiculoId": 1,
  "dias": 4,
  "fechaInicio": "2026-07-09",
  "fechaFin": "2026-07-13",
  "total": 960
}
```

### DELETE /api/alquileres/{id}

Elimina un alquiler por su `id`.

Ejemplo:

```text
DELETE http://localhost:8083/api/alquileres/1
```

## Como explicar el flujo basico

1. Primero se registra un vehiculo en el microservicio `hct-vehiculo`.
2. Luego se registra un cliente en el microservicio `hct-cliente`.
3. Finalmente se registra un alquiler en `hct-alquiler`, usando el `clienteId` y el `vehiculoId`.
4. El frontend React consume los 3 microservicios con `fetch`.
5. Los 3 microservicios usan WebFlux, por eso los controladores devuelven `Mono` o `Flux`.

## Que significa Mono y Flux

- `Mono`: representa una respuesta reactiva de un solo dato o vacia.
- `Flux`: representa una respuesta reactiva de varios datos.

Ejemplo:

- Buscar por ID devuelve `Mono`.
- Listar todos devuelve `Flux`.
