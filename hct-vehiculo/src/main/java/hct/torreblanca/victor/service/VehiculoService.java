package hct.torreblanca.victor.service;

import hct.torreblanca.victor.model.Vehiculo;
import hct.torreblanca.victor.repository.VehiculoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.r2dbc.core.DatabaseClient;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class VehiculoService {

    private final VehiculoRepository repository;
    private final DatabaseClient databaseClient;

    public Flux<Vehiculo> listar() {
        return liberarAlquileresVencidos().thenMany(repository.findAll());
    }

    public Mono<Vehiculo> buscarPorId(Long id) {
        return liberarAlquileresVencidos().then(repository.findById(id));
    }

    public Mono<Vehiculo> crear(Vehiculo vehiculo) {
        vehiculo.setId(null);
        vehiculo.setEstado("DISPONIBLE");
        return repository.save(vehiculo);
    }

    public Mono<Vehiculo> actualizar(Long id, Vehiculo vehiculo) {
        return repository.findById(id)
                .flatMap(actual -> {
                    vehiculo.setId(actual.getId());
                    vehiculo.setEstado(actual.getEstado());
                    return repository.save(vehiculo);
                });
    }

    public Mono<Vehiculo> cambiarEstado(Long id, String estado) {
        if (!"DISPONIBLE".equals(estado) && !"FUERA_SERVICIO".equals(estado)) {
            return Mono.error(new IllegalStateException("Estado no permitido"));
        }
        return liberarAlquileresVencidos()
                .then(repository.findById(id))
                .flatMap(vehiculo -> {
                    if ("EN_ALQUILER".equals(vehiculo.getEstado())) {
                        return Mono.error(new IllegalStateException("Vehiculo alquilado"));
                    }
                    vehiculo.setEstado(estado);
                    return repository.save(vehiculo);
                });
    }

    public Mono<Void> eliminar(Long id) {
        return liberarAlquileresVencidos()
                .then(tieneAlquilerActivo(id))
                .flatMap(alquilado -> alquilado
                        ? Mono.error(new IllegalStateException("Vehiculo alquilado"))
                        : repository.deleteById(id));
    }

    private Mono<Void> liberarAlquileresVencidos() {
        return databaseClient.sql("""
                        UPDATE vehiculos
                        SET estado = 'DISPONIBLE'
                        WHERE id IN (
                            SELECT vehiculo_id
                            FROM alquileres
                            WHERE estado = 'ACTIVO' AND fecha_fin < CURRENT_DATE
                        )
                        """)
                .fetch()
                .rowsUpdated()
                .then(databaseClient.sql("UPDATE alquileres SET estado = 'FINALIZADO' WHERE estado = 'ACTIVO' AND fecha_fin < CURRENT_DATE")
                        .fetch()
                        .rowsUpdated())
                .then();
    }

    private Mono<Boolean> tieneAlquilerActivo(Long vehiculoId) {
        return databaseClient.sql("""
                        SELECT COUNT(*) AS cantidad
                        FROM alquileres
                        WHERE vehiculo_id = :vehiculoId
                          AND estado = 'ACTIVO'
                          AND fecha_fin >= CURRENT_DATE
                        """)
                .bind("vehiculoId", vehiculoId)
                .map((row, metadata) -> ((Number) row.get("cantidad")).longValue())
                .one()
                .map(cantidad -> cantidad > 0)
                .defaultIfEmpty(false);
    }
}
