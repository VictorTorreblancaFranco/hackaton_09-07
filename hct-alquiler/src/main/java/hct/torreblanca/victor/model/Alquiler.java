package hct.torreblanca.victor.model;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Table("alquileres")
public class Alquiler {

    @Id
    private Long id;

    @NotNull
    private Long clienteId;

    @NotNull
    private Long vehiculoId;

    @NotNull
    @Min(1)
    private Integer dias;

    @NotNull
    private LocalDate fechaInicio;

    @NotNull
    private LocalDate fechaFin;

    @NotNull
    @DecimalMin("1.00")
    private BigDecimal total;

    @NotBlank
    private String estado;
}
