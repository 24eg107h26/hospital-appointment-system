package com.anurag.hospital.repository;

import com.anurag.hospital.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

      // Finds a user by their registered email address for authentication and profile lookup
      Optional<User> findByEmail(String email);

      // Checks if an account already exists with the given email during registration
      boolean existsByEmail(String email);

}
