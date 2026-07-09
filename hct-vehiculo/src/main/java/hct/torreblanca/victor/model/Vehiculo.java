package hct.torreblanca.victor.model;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Table("vehiculos")
public class Vehiculo {

    @Id
    private Long id;

    @NotBlank
    @Pattern(regexp = "^(?=.*[A-Z0-9])[A-Z0-9-]{1,6}$")
    private String placa;

    @NotBlank
    private String marca;

    @NotBlank
    private String modelo;

    @NotNull
    @Min(2000)
    private Integer anio;

    @NotBlank
    @Pattern(regexp = "^[A-Za-z ]+$")
    private String color;

    @NotNull
    @DecimalMin("1.00")
    private BigDecimal precioPorDia;

    @NotBlank
    private String estado = "DISPONIBLE";
}
