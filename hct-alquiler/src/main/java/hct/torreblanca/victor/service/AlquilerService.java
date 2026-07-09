package hct.torreblanca.victor.service;

import hct.torreblanca.victor.model.Alquiler;
import hct.torreblanca.victor.repository.AlquilerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.r2dbc.core.DatabaseClient;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class AlquilerService {

    private final AlquilerRepository repository;
    private final DatabaseClient databaseClient;

    public Flux<Alquiler> listar() {
        return liberarAlquileresVencidos().thenMany(repository.findAll());
    }

    public Mono<Alquiler> buscarPorId(Long id) {
        return liberarAlquileresVencidos().then(repository.findById(id));
    }

    public Mono<Alquiler> crear(Alquiler alquiler) {
        alquiler.setId(null);
        alquiler.setEstado("ACTIVO");
        return liberarAlquileresVencidos()
                .then(marcarVehiculoEnAlquiler(alquiler.getVehiculoId()))
                .then(repository.save(alquiler));
    }

    public Mono<Alquiler> actualizar(Long id, Alquiler alquiler) {
        return liberarAlquileresVencidos()
                .then(repository.findById(id))
                .flatMap(actual -> {
                    alquiler.setId(actual.getId());
                    alquiler.setEstado(actual.getEstado());
                    if (actual.getVehiculoId().equals(alquiler.getVehiculoId())) {
                        return repository.save(alquiler);
                    }
                    return marcarVehiculoDisponible(actual.getVehiculoId())
                            .then(marcarVehiculoEnAlquiler(alquiler.getVehiculoId()))
                            .then(repository.save(alquiler));
                });
    }

    public Mono<Void> eliminar(Long id) {
        return liberarAlquileresVencidos()
                .then(repository.findById(id))
                .flatMap(alquiler -> repository.deleteById(id)
                        .then(marcarVehiculoDisponible(alquiler.getVehiculoId())));
    }

    private Mono<Void> marcarVehiculoEnAlquiler(Long vehiculoId) {
        return databaseClient.sql("UPDATE vehiculos SET estado = 'EN_ALQUILER' WHERE id = :id AND estado = 'DISPONIBLE'")
                .bind("id", vehiculoId)
                .fetch()
                .rowsUpdated()
                .flatMap(filas -> filas > 0
                        ? Mono.<Void>empty()
                        : Mono.error(new IllegalStateException("Vehiculo no disponible")));
    }

    private Mono<Void> marcarVehiculoDisponible(Long vehiculoId) {
        return databaseClient.sql("UPDATE vehiculos SET estado = 'DISPONIBLE' WHERE id = :id")
                .bind("id", vehiculoId)
                .fetch()
                .rowsUpdated()
                .then();
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
}
