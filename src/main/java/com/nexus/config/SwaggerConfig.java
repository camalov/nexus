package com.nexus.config;

import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeIn;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import io.swagger.v3.oas.models.PathItem;
import io.swagger.v3.oas.models.media.StringSchema;
import io.swagger.v3.oas.models.parameters.Parameter;
import org.springdoc.core.customizers.OpenApiCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Map;

@Configuration
@SecurityScheme(
        name = "bearerAuth",
        description = "JWT authentication",
        scheme = "bearer",
        type = SecuritySchemeType.HTTP,
        bearerFormat = "JWT",
        in = SecuritySchemeIn.HEADER
)
public class SwaggerConfig {


    //auth`dan başqa bütün endpointlər üçün JWT tələb edirik
    @Bean
    public OpenApiCustomizer jwtHeaderCustomizer() {
        return openApi -> {
            for (Map.Entry<String, PathItem> entry : openApi.getPaths().entrySet()) {
                String path = entry.getKey();
                PathItem pathItem = entry.getValue();

                // /login sözü olan endpointləri nəzərə alma
                if (!path.contains("auth")) {
                    // Bütün əməliyyatlar üçün header əlavə et
                    pathItem.readOperations().forEach(operation -> {
                        Parameter jwtHeader = new Parameter()
                                .name("X-Authorization") // JWT header adı
                                .in(ParameterIn.HEADER.toString())
                                .schema(new StringSchema())
                                .required(false)
                                .description("JWT Token");
                        operation.addParametersItem(jwtHeader);
                    });
                }
            }
        };

    }

    //bomba kimi koddur bunu itirme))
    /*
    @Bean
    public OpenApiCustomizer conditionalHeaderCustomizer() {
        return openApi -> {
            for (Map.Entry<String, PathItem> entry : openApi.getPaths().entrySet()) {
                String path = entry.getKey();
                PathItem pathItem = entry.getValue();

                // /login sözü olan endpointləri nəzərə alma
                if (!path.contains("message")) {
                    // Bütün əməliyyatlar üçün header əlavə et
                    pathItem.readOperations().forEach(operation -> {
                        Parameter jwtHeader = new Parameter()
                                .name("Authorization") // JWT header adı
                                .in("header")
                                .required(true)
                                .description("JWT Token");
                        operation.addParametersItem(jwtHeader);
                    });
                }
            }
        };
    }
     */

}
