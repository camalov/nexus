package com.nexus.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${file.upload-dir}")
    private String uploadDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Make sure to provide the absolute path with the "file:" prefix
        String resourceLocation = "file:" + System.getProperty("user.dir") + "/" + uploadDir + "/";
        registry.addResourceHandler("/media/**")
                .addResourceLocations(resourceLocation);
    }
}
