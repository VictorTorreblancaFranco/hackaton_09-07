package hct.torreblanca.victor.service;

import hct.torreblanca.victor.model.Alquiler;
import hct.torreblanca.victor.repository.AlquilerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class AlquilerService {

    private final AlquilerRepository repository;

    public Flux<Alquiler> listar() {
        return repository.findAll();
    }

    public Mono<Alquiler> buscarPorId(Long id) {
        return repository.findById(id);
    }

    public Mono<Alquiler> crear(Alquiler alquiler) {
        alquiler.setId(null);
        return repository.save(alquiler);
    }

    public Mono<Alquiler> actualizar(Long id, Alquiler alquiler) {
        return repository.findById(id)
                .flatMap(actual -> {
                    alquiler.setId(actual.getId());
                    return repository.save(alquiler);
                });
    }

    public Mono<Void> eliminar(Long id) {
        return repository.deleteById(id);
    }
}
