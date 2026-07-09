package hct.torreblanca.victor.service;

import hct.torreblanca.victor.model.Vehiculo;
import hct.torreblanca.victor.repository.VehiculoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class VehiculoService {

    private final VehiculoRepository repository;

    public Flux<Vehiculo> listar() {
        return repository.findAll();
    }

    public Mono<Vehiculo> buscarPorId(Long id) {
        return repository.findById(id);
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
        return repository.findById(id)
                .flatMap(vehiculo -> {
                    vehiculo.setEstado(estado);
                    return repository.save(vehiculo);
                });
    }

    public Mono<Void> eliminar(Long id) {
        return repository.deleteById(id);
    }
}
