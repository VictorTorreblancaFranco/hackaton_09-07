# HACKATHON AS241S5 - Alquiler de Vehiculos

Proyecto basico con 3 microservicios separados usando Spring WebFlux, R2DBC PostgreSQL y Lombok.

## Microservicios

| Servicio | Puerto | Endpoint principal |
| --- | ---: | --- |
| hct-vehiculo | 8081 | `/api/vehiculos` |
| hct-cliente | 8082 | `/api/clientes` |
| hct-alquiler | 8083 | `/api/alquileres` |
| hct-frontend | 5173 | React |

Todos usan la misma base de datos PostgreSQL Neon, pero cada uno crea y usa su propia tabla:

- `vehiculos`
- `clientes`
- `alquileres`

## Ejecutar

Antes de prender cada microservicio, configurar la conexion a PostgreSQL:

```bash
export DB_URL='r2dbc:postgresql://ep-old-union-at7ovm0b-pooler.c-9.us-east-1.aws.neon.tech/neondb?sslMode=require'
export DB_USERNAME='neondb_owner'
export DB_PASSWORD='TU_PASSWORD'
```

Abrir una terminal por microservicio:

```bash
cd hct-vehiculo
mvn spring-boot:run
```

```bash
cd hct-cliente
mvn spring-boot:run
```

```bash
cd hct-alquiler
mvn spring-boot:run
```

Luego abrir otra terminal para el frontend:

```bash
cd hct-frontend
npm install
npm run dev
```

El navegador debe abrir:

```text
http://localhost:5173
```

## Conexion del frontend

El frontend React usa `fetch` para llamar a cada microservicio:

```text
Vehiculos  -> http://localhost:8081/api/vehiculos
Clientes   -> http://localhost:8082/api/clientes
Alquileres -> http://localhost:8083/api/alquileres
```

Cada backend tiene una clase `CorsConfig` para permitir llamadas desde:

```text
http://localhost:5173
```

## Ejemplos para probar

### Crear vehiculo

```bash
curl -X POST http://localhost:8081/api/vehiculos \
  -H "Content-Type: application/json" \
  -d '{
    "placa": "ABC-123",
    "marca": "Toyota",
    "modelo": "Corolla",
    "anio": 2026,
    "color": "Blanco",
    "precioPorDia": 150,
    "estado": "DISPONIBLE"
  }'
```

### Crear cliente

```bash
curl -X POST http://localhost:8082/api/clientes \
  -H "Content-Type: application/json" \
  -d '{
    "dni": "72654321",
    "nombres": "Miguel Luis",
    "apellidos": "Lopez Sanchez",
    "celular": "987654321",
    "correo": "miguel@gmail.com",
    "licencia": "Q12345678",
    "estado": "ACTIVO"
  }'
```

### Crear alquiler

```bash
curl -X POST http://localhost:8083/api/alquileres \
  -H "Content-Type: application/json" \
  -d '{
    "clienteId": 1,
    "vehiculoId": 1,
    "dias": 3,
    "fechaInicio": "2026-07-03",
    "fechaFin": "2026-07-06",
    "total": 720,
    "estado": "ACTIVO"
  }'
```

## Operaciones CRUD

Cada servicio tiene las mismas operaciones basicas:

- `GET /api/...` lista todos
- `GET /api/.../{id}` busca por id
- `POST /api/...` crea
- `PUT /api/.../{id}` actualiza
- `DELETE /api/.../{id}` elimina

## Documentacion y Postman

Archivos incluidos:

- `docs/DOCUMENTACION_ENDPOINTS.md`: explica que hace cada endpoint.
- `docs/GUIA_SUSTENTACION.md`: resumen corto para exponer el proyecto.
- `postman/HCT-Alquiler-Vehiculos.postman_collection.json`: coleccion Postman con requests de los 3 servicios.

Para usar Postman:

1. Abrir Postman.
2. Importar el archivo `HCT-Alquiler-Vehiculos.postman_collection.json`.
3. Prender los 3 microservicios.
4. Ejecutar primero Crear vehiculo, luego Crear cliente y al final Crear alquiler.

## Nota sobre JDK 26

El codigo esta configurado con `<java.version>26</java.version>`.
Con el entorno actual, `mvn compile` y `mvn package` funcionan en los 3 servicios.
Para evitar problemas del `spring-boot:repackage` con classfile major 70 de JDK 26, se desactivo solo ese reempaquetado automatico. Para ejecutar durante la exposicion usa:

```bash
mvn spring-boot:run
```
