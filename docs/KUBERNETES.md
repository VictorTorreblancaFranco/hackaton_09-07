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

## Explicacion para sustentar

El deployment levanta el contenedor.
El service permite acceder al contenedor.
El secret guarda las variables de base de datos.
El namespace agrupa todos los recursos del proyecto.

