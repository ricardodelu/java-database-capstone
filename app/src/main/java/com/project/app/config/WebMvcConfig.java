package com.project.app.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {
    
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Serve static resources from /static and /public
        registry.addResourceHandler(
                "/**"
        ).addResourceLocations(
                "classpath:/static/",
                "classpath:/public/"
        );
        
        // Cache control for development
        if (!registry.hasMappingForPattern("/assets/**")) {
            registry.addResourceHandler("/assets/**")
                   .addResourceLocations("classpath:/static/assets/")
                   .setCachePeriod(0); // No cache for development
        }
    }
}
