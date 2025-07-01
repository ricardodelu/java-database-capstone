package com.project.app.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import com.project.app.models.Admin;

@Repository
public interface AdminRepo extends JpaRepository<Admin, Long> {
    
    /**
     * Find an admin by their username
     * @param username the username to search for
     * @return Optional containing the admin if found
     */
    Optional<Admin> findByUsername(String username);

    /**
     * Check if an admin exists with the given username
     * @param username the username to check
     * @return true if an admin exists with this username
     */
    boolean existsByUsername(String username);
}
