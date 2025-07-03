package com.project.app.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;
import org.springframework.web.servlet.resource.PathResourceResolver;

import java.io.IOException;

@Configuration
@EnableWebMvc
public class WebMvcConfig implements WebMvcConfigurer {
    
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Serve all static resources from /static/
        registry.addResourceHandler(
                "/**"
        ).addResourceLocations(
                "classpath:/static/"
        ).resourceChain(true)
         .addResolver(new PathResourceResolver() {
             @Override
             protected Resource getResource(String resourcePath, Resource location) throws IOException {
                 Resource requestedResource = location.createRelative(resourcePath);
                 return requestedResource.exists() && requestedResource.isReadable() ? requestedResource
                         : new ClassPathResource("/static/index.html");
             }
         });
        
        // Explicitly handle common static file patterns
        registry.addResourceHandler(
                "/css/**",
                "/js/**",
                "/images/**",
                "/fonts/**",
                "/assets/**"
        ).addResourceLocations(
                "classpath:/static/css/",
                "classpath:/static/js/",
                "classpath:/static/images/",
                "classpath:/static/fonts/",
                "classpath:/static/assets/"
        ).setCachePeriod(0); // No cache for development
        
        // WebJars for client-side libraries
        registry.addResourceHandler("/webjars/**")
               .addResourceLocations("classpath:/META-INF/resources/webjars/")
               .setCachePeriod(0);
    }
}
