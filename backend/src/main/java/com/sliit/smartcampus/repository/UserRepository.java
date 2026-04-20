package com.sliit.smartcampus.repository;

import com.sliit.smartcampus.model.User;
import com.sliit.smartcampus.model.enums.Role;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    boolean existsByRole(Role role);
    List<User> findAllByRole(Role role);
}
