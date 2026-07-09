package hct.torreblanca.victor.rest;

import hct.torreblanca.victor.model.Vehiculo;
import hct.torreblanca.victor.service.VehiculoService;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/vehiculos")
@RequiredArgsConstructor
public class VehiculoController {

    private final VehiculoService service;

    @GetMapping
    public Flux<Vehiculo> listar() {
        return service.listar();
    }

    @GetMapping("/{id}")
    public Mono<ResponseEntity<Vehiculo>> buscarPorId(@PathVariable Long id) {
        return service.buscarPorId(id)
                .map(ResponseEntity::ok)
                .defaultIfEmpty(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Mono<Vehiculo> crear(@Valid @RequestBody Vehiculo vehiculo) {
        return service.crear(vehiculo);
    }

    @PutMapping("/{id}")
    public Mono<ResponseEntity<Vehiculo>> actualizar(@PathVariable Long id, @Valid @RequestBody Vehiculo vehiculo) {
        return service.actualizar(id, vehiculo)
                .map(ResponseEntity::ok)
                .defaultIfEmpty(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/estado")
    public Mono<ResponseEntity<Vehiculo>> cambiarEstado(@PathVariable Long id, @RequestParam String estado) {
        return service.cambiarEstado(id, estado)
                .map(ResponseEntity::ok)
                .onErrorResume(IllegalStateException.class, error -> Mono.just(ResponseEntity.badRequest().build()))
                .defaultIfEmpty(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public Mono<ResponseEntity<Void>> eliminar(@PathVariable Long id) {
        return service.eliminar(id)
                .thenReturn(ResponseEntity.noContent().<Void>build())
                .onErrorResume(IllegalStateException.class, error -> Mono.just(ResponseEntity.badRequest().build()));
    }
}
