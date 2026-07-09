package hct.torreblanca.victor.rest;

import hct.torreblanca.victor.model.Alquiler;
import hct.torreblanca.victor.service.AlquilerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/alquileres")
@RequiredArgsConstructor
public class AlquilerController {

    private final AlquilerService service;

    @GetMapping
    public Flux<Alquiler> listar() {
        return service.listar();
    }

    @GetMapping("/{id}")
    public Mono<ResponseEntity<Alquiler>> buscarPorId(@PathVariable Long id) {
        return service.buscarPorId(id)
                .map(ResponseEntity::ok)
                .defaultIfEmpty(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Mono<ResponseEntity<Alquiler>> crear(@Valid @RequestBody Alquiler alquiler) {
        return service.crear(alquiler)
                .map(ResponseEntity::ok)
                .onErrorResume(IllegalStateException.class, error -> Mono.just(ResponseEntity.badRequest().build()));
    }

    @PutMapping("/{id}")
    public Mono<ResponseEntity<Alquiler>> actualizar(@PathVariable Long id, @Valid @RequestBody Alquiler alquiler) {
        return service.actualizar(id, alquiler)
                .map(ResponseEntity::ok)
                .onErrorResume(IllegalStateException.class, error -> Mono.just(ResponseEntity.badRequest().build()))
                .defaultIfEmpty(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public Mono<ResponseEntity<Void>> eliminar(@PathVariable Long id) {
        return service.eliminar(id)
                .thenReturn(ResponseEntity.noContent().<Void>build());
    }
}
