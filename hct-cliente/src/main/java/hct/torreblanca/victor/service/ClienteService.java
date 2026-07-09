package hct.torreblanca.victor.service;

import hct.torreblanca.victor.model.Cliente;
import hct.torreblanca.victor.repository.ClienteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class ClienteService {

    private final ClienteRepository repository;

    public Flux<Cliente> listar() {
        return repository.findAll();
    }

    public Mono<Cliente> buscarPorId(Long id) {
        return repository.findById(id);
    }

    public Mono<Cliente> crear(Cliente cliente) {
        cliente.setId(null);
        cliente.setEstado("ACTIVO");
        return repository.save(cliente);
    }

    public Mono<Cliente> actualizar(Long id, Cliente cliente) {
        return repository.findById(id)
                .flatMap(actual -> {
                    cliente.setId(actual.getId());
                    cliente.setEstado(actual.getEstado());
                    return repository.save(cliente);
                });
    }

    public Mono<Void> eliminar(Long id) {
        return repository.deleteById(id);
    }
}
