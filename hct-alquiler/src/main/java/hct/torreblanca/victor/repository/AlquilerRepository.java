package hct.torreblanca.victor.repository;

import hct.torreblanca.victor.model.Alquiler;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;

public interface AlquilerRepository extends ReactiveCrudRepository<Alquiler, Long> {
}
