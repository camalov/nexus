package com.nexus.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenAPIConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        // Define the security scheme (Bearer Authentication)
        final String securitySchemeName = "bearerAuth";

        return new OpenAPI()
            // Add the security scheme to the components
            .components(new Components()
                .addSecuritySchemes(securitySchemeName, new SecurityScheme()
                    .type(SecurityScheme.Type.HTTP)
                    .scheme("bearer")
                    .bearerFormat("JWT")
                )
            )
            // Add a global security requirement to apply bearer auth to all endpoints
            .addSecurityItem(new SecurityRequirement().addList(securitySchemeName))
            // Set basic API information
            .info(new Info()
                .title("Nexus Chat API")
                .version("v1.0")
                .description("API documentation for the Nexus real-time chat application.")
            );
    }
}
