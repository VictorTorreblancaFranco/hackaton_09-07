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

Importante: el frontend se ejecuta en el navegador. Por eso, cuando esta en local, el navegador llama a los servicios por `localhost`.

Flujo local:

```text
Navegador -> React localhost:5173
React     -> Vehiculos localhost:8081
React     -> Clientes localhost:8082
React     -> Alquileres localhost:8083
```

Si se usa Kubernetes sin Ingress ni gateway, se puede probar con port-forward para conservar las mismas URLs:

```bash
kubectl port-forward svc/hct-vehiculo-service 8081:8081 -n hct-alquiler-vehiculos
kubectl port-forward svc/hct-cliente-service 8082:8082 -n hct-alquiler-vehiculos
kubectl port-forward svc/hct-alquiler-service 8083:8083 -n hct-alquiler-vehiculos
```

Asi el frontend puede seguir llamando a `localhost:8081`, `localhost:8082` y `localhost:8083`.

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
    "precioPorDia": 150
  }'
```

El estado se asigna automaticamente como `DISPONIBLE`.
La placa usa 6 caracteres en formato `ABC-123`.
El precio se muestra en el frontend como `S/ 150.00`.

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
    "licencia": "Q12345678"
  }'
```

El estado se asigna automaticamente como `ACTIVO`.
Al crear el alquiler, el vehiculo pasa automaticamente a `EN_ALQUILER`.
El total se muestra en el frontend como `S/ 720.00`.
En el frontend, la fecha de inicio aparece por defecto con la fecha de hoy y se puede modificar.

### Crear alquiler

```bash
curl -X POST http://localhost:8083/api/alquileres \
  -H "Content-Type: application/json" \
  -d '{
    "clienteId": 1,
    "vehiculoId": 1,
    "dias": 3,
    "fechaInicio": "2026-07-09",
    "fechaFin": "2026-07-12",
    "total": 720
  }'
```

El estado se asigna automaticamente como `ACTIVO`.

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
- `manifest-vehiculo/`: manifiestos Kubernetes del microservicio vehiculo.
- `manifest-cliente/`: manifiestos Kubernetes del microservicio cliente.
- `manifest-alquiler/`: manifiestos Kubernetes del microservicio alquiler.
- `manifest-frontend/`: manifiestos Kubernetes del frontend.

Google Doc de despliegue:

```text
https://docs.google.com/document/d/10jE1MBeyp4acSxOPNWVpVo6mHkI4QU021Pbc7iWIcUo/edit
```

Para usar Postman:

1. Abrir Postman.
2. Importar el archivo `HCT-Alquiler-Vehiculos.postman_collection.json`.
3. Prender los 3 microservicios.
4. Ejecutar primero Crear vehiculo, luego Crear cliente y al final Crear alquiler.

## Docker

Cada proyecto tiene su `Dockerfile`.

Ejemplo para construir imagenes:

```bash
docker build -t victortorreblancafranco/hct-vehiculo:latest hct-vehiculo
docker build -t victortorreblancafranco/hct-cliente:latest hct-cliente
docker build -t victortorreblancafranco/hct-alquiler:latest hct-alquiler
docker build -t victortorreblancafranco/hct-frontend:latest hct-frontend
```

Ejemplo para subir a DockerHub:

```bash
docker push victortorreblancafranco/hct-vehiculo:latest
docker push victortorreblancafranco/hct-cliente:latest
docker push victortorreblancafranco/hct-alquiler:latest
docker push victortorreblancafranco/hct-frontend:latest
```

## Kubernetes

Antes de aplicar los manifiestos, cambiar `TU_PASSWORD` en los archivos `secret.yml`.

Aplicar manifiestos:

```bash
kubectl apply -f manifest-vehiculo/
kubectl apply -f manifest-cliente/
kubectl apply -f manifest-alquiler/
kubectl apply -f manifest-frontend/
```

Verificar pods y servicios:

```bash
kubectl get pods -n hct-alquiler-vehiculos
kubectl get svc -n hct-alquiler-vehiculos
```

El frontend queda expuesto por NodePort:

```text
http://localhost:30080
```

Para que el frontend desplegado pueda consultar a los backends durante una demo local, usar port-forward de los 3 servicios backend o exponerlos tambien por NodePort/Ingress.

## Nota sobre JDK 26

El codigo esta configurado con `<java.version>26</java.version>`.
Con el entorno actual, `mvn compile` y `mvn package` funcionan en los 3 servicios.
Para evitar problemas del `spring-boot:repackage` con classfile major 70 de JDK 26, se desactivo solo ese reempaquetado automatico. Para ejecutar durante la exposicion usa:

```bash
mvn spring-boot:run
```
