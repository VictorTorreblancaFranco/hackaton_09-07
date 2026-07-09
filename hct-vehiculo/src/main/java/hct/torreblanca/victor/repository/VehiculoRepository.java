package hct.torreblanca.victor.repository;

import hct.torreblanca.victor.model.Vehiculo;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;

public interface VehiculoRepository extends ReactiveCrudRepository<Vehiculo, Long> {
}
