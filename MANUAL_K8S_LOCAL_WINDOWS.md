# Manual rapido para levantar el proyecto en Windows

Usar estos pasos desde la terminal de Visual Studio Code o IntelliJ IDEA.

El proyecto se levanta con Docker Desktop + Kubernetes usando imagenes locales.

---

# 1. Entrar al proyecto

```bash
cd hackaton_09-07
git checkout develop
```

---

# 2. Construir las 4 imagenes locales

Ejecutar desde la raiz del proyecto:

```bash
docker build -t hct-vehiculo:local ./hct-vehiculo
docker build -t hct-cliente:local ./hct-cliente
docker build -t hct-alquiler:local ./hct-alquiler
docker build -t hct-frontend:local ./hct-frontend
```

Verificar que existen:

```bash
docker images
```

Deben aparecer estas imagenes:

```text
hct-vehiculo    local
hct-cliente     local
hct-alquiler    local
hct-frontend    local
```

---

# 3. Levantar todo con Kubernetes

Ejecutar estos 4 comandos:

```bash
kubectl apply -f hct-vehiculo/k8s
kubectl apply -f hct-cliente/k8s
kubectl apply -f hct-alquiler/k8s
kubectl apply -f hct-frontend/k8s
```

Verificar que los pods esten corriendo:

```bash
kubectl get pods -n hct-alquiler-vehiculos
```

Todos deben salir como `Running`.

---

# 4. Abrir el sistema

Para que el frontend pueda comunicarse con los microservicios en tu maquina, abre 4 terminales.

## Terminal 1 - Vehiculo

```bash
kubectl port-forward svc/hct-vehiculo-service 8081:8081 -n hct-alquiler-vehiculos
```

## Terminal 2 - Cliente

```bash
kubectl port-forward svc/hct-cliente-service 8082:8082 -n hct-alquiler-vehiculos
```

## Terminal 3 - Alquiler

```bash
kubectl port-forward svc/hct-alquiler-service 8083:8083 -n hct-alquiler-vehiculos
```

## Terminal 4 - Frontend

```bash
kubectl port-forward svc/hct-frontend-service 30080:80 -n hct-alquiler-vehiculos
```

Luego abrir en el navegador:

```text
http://localhost:30080
```

---

# 5. Levantar todo de una vez

Si quieres hacerlo mas rapido, ejecuta esto desde la raiz del proyecto:

```bash
docker build -t hct-vehiculo:local ./hct-vehiculo
docker build -t hct-cliente:local ./hct-cliente
docker build -t hct-alquiler:local ./hct-alquiler
docker build -t hct-frontend:local ./hct-frontend

kubectl apply -f hct-vehiculo/k8s
kubectl apply -f hct-cliente/k8s
kubectl apply -f hct-alquiler/k8s
kubectl apply -f hct-frontend/k8s

kubectl get pods -n hct-alquiler-vehiculos
```

Despues igual debes dejar abiertos los 4 `port-forward` del paso 4.

---

# 6. Probar endpoints rapido

Con los `port-forward` activos:

```bash
curl http://localhost:8081/api/vehiculos
curl http://localhost:8082/api/clientes
curl http://localhost:8083/api/alquileres
```

---

# 7. Si el profesor cambia el nombre de una imagen

Ejemplo: si te pide que la imagen de vehiculo se llame `vehiculo-demo:local`, construyes asi:

```bash
docker build -t vehiculo-demo:local ./hct-vehiculo
```

Luego en este archivo:

```text
hct-vehiculo/k8s/deployment.yml
```

Cambias:

```yaml
image: hct-vehiculo:local
```

Por:

```yaml
image: vehiculo-demo:local
```

Debe quedar tambien:

```yaml
imagePullPolicy: Never
```

Eso significa que Kubernetes usara la imagen local y no la buscara en internet.

---

# 8. Si el profesor cambia el nombre de los manifests

No hay problema si aplicas la carpeta completa:

```bash
kubectl apply -f hct-vehiculo/k8s
kubectl apply -f hct-cliente/k8s
kubectl apply -f hct-alquiler/k8s
kubectl apply -f hct-frontend/k8s
```

Kubernetes lee todos los `.yml` que esten dentro de cada carpeta.

---

# 9. Apagar todo

```bash
kubectl delete -f hct-frontend/k8s
kubectl delete -f hct-alquiler/k8s
kubectl delete -f hct-cliente/k8s
kubectl delete -f hct-vehiculo/k8s
```
