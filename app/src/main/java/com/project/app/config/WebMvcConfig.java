package com.project.app.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;
import org.springframework.web.servlet.resource.PathResourceResolver;
import org.springframework.http.CacheControl;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;

import java.io.IOException;
import java.util.concurrent.TimeUnit;

@Configuration
@EnableWebMvc
public class WebMvcConfig implements WebMvcConfigurer {
    
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Serve static resources with proper MIME types and caching
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
        ).setCacheControl(CacheControl.maxAge(1, TimeUnit.HOURS).cachePublic());
        
        // Handle root path and SPA routing
        registry.addResourceHandler(
                "/**"
        ).addResourceLocations(
                "classpath:/static/"
        ).resourceChain(true)
         .addResolver(new PathResourceResolver() {
             @Override
             protected Resource getResource(String resourcePath, Resource location) throws IOException {
                 Resource requestedResource = location.createRelative(resourcePath);
                 if (requestedResource.exists() && requestedResource.isReadable()) {
                     return requestedResource;
                 }
                 // For any other request, serve index.html for SPA routing
                 return new ClassPathResource("/static/index.html");
             }
         });
        
        // WebJars for client-side libraries
        registry.addResourceHandler("/webjars/**")
               .addResourceLocations("classpath:/META-INF/resources/webjars/")
               .setCacheControl(CacheControl.maxAge(1, TimeUnit.HOURS).cachePublic());
    }
    
    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        // Map specific views
        registry.addViewController("/").setViewName("forward:/index.html");
        registry.addViewController("/admin").setViewName("forward:/admin/dashboard");
    }
}
