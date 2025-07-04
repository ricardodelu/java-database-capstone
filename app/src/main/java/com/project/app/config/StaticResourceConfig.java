package com.project.app.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
@EnableWebMvc
public class StaticResourceConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Serve static resources from /static/ directory
        registry.addResourceHandler(
                "/css/**",
                "/js/**",
                "/images/**",
                "/assets/**"
        ).addResourceLocations(
                "classpath:/static/css/",
                "classpath:/static/js/",
                "classpath:/static/images/",
                "classpath:/static/assets/"
        ).setCachePeriod(0);

        // Handle WebJars for client-side libraries
        registry.addResourceHandler("/webjars/**")
                .addResourceLocations("classpath:/META-INF/resources/webjars/")
                .setCachePeriod(0);
    }
}
