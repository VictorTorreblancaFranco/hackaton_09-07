# Kubernetes basico

Se crearon manifiestos para los 3 microservicios backend y el frontend.

## Carpetas

```text
manifest-vehiculo/
manifest-cliente/
manifest-alquiler/
manifest-frontend/
```

## Archivos por carpeta

Cada carpeta contiene:

- `namespace.yml`: crea el namespace `hct-alquiler-vehiculos`.
- `secret.yml`: guarda variables de entorno.
- `service.yml`: expone el pod dentro del cluster.
- `deployment.yml`: indica que imagen Docker se ejecuta.

## Imagenes Docker

Los deployments usan estas imagenes:

```text
victortorreblancafranco/hct-vehiculo:latest
victortorreblancafranco/hct-cliente:latest
victortorreblancafranco/hct-alquiler:latest
victortorreblancafranco/hct-frontend:latest
```

Si usas otro usuario de DockerHub, cambia el campo `image` en cada deployment.

## Aplicar manifiestos

Antes de aplicar, cambiar `TU_PASSWORD` en:

```text
manifest-vehiculo/*secret.yml
manifest-cliente/*secret.yml
manifest-alquiler/*secret.yml
```

Luego ejecutar:

```bash
kubectl apply -f manifest-vehiculo/
kubectl apply -f manifest-cliente/
kubectl apply -f manifest-alquiler/
kubectl apply -f manifest-frontend/
```

## Verificar

```bash
kubectl get pods -n hct-alquiler-vehiculos
kubectl get deployments -n hct-alquiler-vehiculos
kubectl get svc -n hct-alquiler-vehiculos
```

## Abrir frontend

El frontend usa `NodePort` con el puerto `30080`.

```text
http://localhost:30080
```

## Conexion del frontend con los backends

El codigo React consume estas URLs:

```text
http://localhost:8081/api/vehiculos
http://localhost:8082/api/clientes
http://localhost:8083/api/alquileres
```

En local funciona porque los microservicios corren en esos puertos.

En Kubernetes, si no hay Ingress ni API Gateway, la forma mas simple para una demo es usar port-forward:

```bash
kubectl port-forward svc/hct-vehiculo-service 8081:8081 -n hct-alquiler-vehiculos
kubectl port-forward svc/hct-cliente-service 8082:8082 -n hct-alquiler-vehiculos
kubectl port-forward svc/hct-alquiler-service 8083:8083 -n hct-alquiler-vehiculos
```

Con eso, el navegador puede seguir usando las mismas URLs `localhost`.

Explicacion para sustentar:

```text
El frontend no se conecta directo a la base de datos.
El frontend llama por HTTP a los microservicios.
Cada microservicio usa R2DBC para conectarse a PostgreSQL.
```

## Explicacion para sustentar

El deployment levanta el contenedor.
El service permite acceder al contenedor.
El secret guarda las variables de base de datos.
El namespace agrupa todos los recursos del proyecto.
