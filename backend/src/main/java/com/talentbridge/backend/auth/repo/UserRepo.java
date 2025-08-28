package com.talentbridge.backend.auth.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.talentbridge.backend.auth.model.Users;


@Repository
public interface UserRepo extends JpaRepository<Users, Integer>{
    Users findByEmail(String email);
}

