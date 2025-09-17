package com.talentbridge.backend.recruiter.repo;

import com.talentbridge.backend.recruiter.model.Recruiter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RecruiterRepo extends JpaRepository<Recruiter, Long> {
    Optional<Recruiter> findByUserId(Long user_id);
}
