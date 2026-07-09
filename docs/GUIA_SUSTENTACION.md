# Guia breve para sustentar

## Resumen del proyecto

Este proyecto es un sistema basico de alquiler de vehiculos.
Tiene 3 microservicios backend y 1 frontend.

Backend:

- `hct-vehiculo`: CRUD de vehiculos.
- `hct-cliente`: CRUD de clientes.
- `hct-alquiler`: transaccion de alquiler.

Frontend:

- `hct-frontend`: interfaz React para registrar, listar, editar y eliminar datos.

## Como se conecta el frontend

El frontend no se conecta a PostgreSQL.
El frontend consume endpoints HTTP de los microservicios.

```text
React -> Vehiculos  -> http://localhost:8081/api/vehiculos
React -> Clientes   -> http://localhost:8082/api/clientes
React -> Alquileres -> http://localhost:8083/api/alquileres
```

Luego cada microservicio se conecta a PostgreSQL.

```text
Frontend React -> Microservicios WebFlux -> PostgreSQL Neon
```

## Por que son microservicios

Son microservicios porque cada proyecto corre separado, tiene su propio puerto y su propia responsabilidad.

```text
hct-vehiculo  -> puerto 8081
hct-cliente   -> puerto 8082
hct-alquiler  -> puerto 8083
hct-frontend  -> puerto 5173
```

## Por que WebFlux

Se usa Spring WebFlux porque los controladores trabajan de forma reactiva:

- `Flux<T>` para listas.
- `Mono<T>` para un solo registro.

Ejemplo:

```java
public Flux<Vehiculo> listar()
```

```java
public Mono<ResponseEntity<Vehiculo>> buscarPorId(Long id)
```

## Capas usadas

Cada microservicio tiene esta estructura:

```text
src/main/java/hct/torreblanca/victor/
  model/
  repository/
  rest/
  service/
```

Explicacion:

- `model`: representa la tabla de la base de datos.
- `repository`: comunica con PostgreSQL usando R2DBC.
- `service`: tiene la logica basica.
- `rest`: expone los endpoints HTTP.

## Base de datos

Se usa PostgreSQL en Neon.
Los tres microservicios usan la misma base de datos, pero tablas separadas.

```text
vehiculos
clientes
alquileres
```

## Flujo de una prueba

1. Crear un vehiculo.
2. Crear un cliente.
3. Crear un alquiler usando:

```json
{
  "clienteId": 1,
  "vehiculoId": 1
}
```

Esto representa que el cliente con ID 1 alquila el vehiculo con ID 1.

## Comandos para ejecutar

En cada terminal de backend, primero configurar la base de datos:

```bash
export DB_URL='r2dbc:postgresql://ep-old-union-at7ovm0b-pooler.c-9.us-east-1.aws.neon.tech/neondb?sslMode=require'
export DB_USERNAME='neondb_owner'
export DB_PASSWORD='TU_PASSWORD'
```

Terminal 1:

```bash
cd hct-vehiculo
mvn spring-boot:run
```

Terminal 2:

```bash
cd hct-cliente
mvn spring-boot:run
```

Terminal 3:

```bash
cd hct-alquiler
mvn spring-boot:run
```

Terminal 4:

```bash
cd hct-frontend
npm run dev
```

Abrir:

```text
http://localhost:5173
```

## Postman

Importar este archivo en Postman:

```text
postman/HCT-Alquiler-Vehiculos.postman_collection.json
```

La coleccion ya tiene carpetas para:

- Vehiculo CRUD
- Cliente CRUD
- Alquiler Transaccion

Cada carpeta tiene:

- Listar
- Buscar por ID
- Crear
- Actualizar
- Eliminar

## Docker

Cada microservicio y el frontend tienen un `Dockerfile`.
El objetivo es convertir cada proyecto en una imagen para poder desplegarla.

Imagenes usadas en los manifiestos:

```text
victortorreblancafranco/hct-vehiculo:latest
victortorreblancafranco/hct-cliente:latest
victortorreblancafranco/hct-alquiler:latest
victortorreblancafranco/hct-frontend:latest
```

## Kubernetes

Se agregaron 4 carpetas de manifiestos:

```text
manifest-vehiculo/
manifest-cliente/
manifest-alquiler/
manifest-frontend/
```

Cada carpeta tiene los 4 archivos pedidos:

```text
namespace.yml
secret.yml
service.yml
deployment.yml
```

Explicacion simple:

- `namespace`: separa los recursos del proyecto.
- `secret`: guarda variables sensibles como usuario y password de base de datos.
- `service`: permite acceder al pod dentro del cluster.
- `deployment`: crea y mantiene corriendo el contenedor.

Comandos:

```bash
kubectl apply -f manifest-vehiculo/
kubectl apply -f manifest-cliente/
kubectl apply -f manifest-alquiler/
kubectl apply -f manifest-frontend/
```

Verificar:

```bash
kubectl get pods -n hct-alquiler-vehiculos
kubectl get svc -n hct-alquiler-vehiculos
```
