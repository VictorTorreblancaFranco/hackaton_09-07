package hct.torreblanca.victor.model;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Table("clientes")
public class Cliente {

    @Id
    private Long id;

    @NotBlank
    @Pattern(regexp = "^[0-9]{8}$")
    private String dni;

    @NotBlank
    private String nombres;

    @NotBlank
    private String apellidos;

    @NotBlank
    @Pattern(regexp = "^[0-9]{9}$")
    private String celular;

    @NotBlank
    @Email
    private String correo;

    @NotBlank
    private String licencia;

    @NotBlank
    private String estado;
}
