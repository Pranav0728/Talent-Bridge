package com.talentbridge.backend.recruiter.service;

import com.talentbridge.backend.recruiter.model.Recruiter;
import com.talentbridge.backend.recruiter.repo.RecruiterRepo;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class RecruiterService {

    @Autowired
    private RecruiterRepo recruiterRepo;

    // Create or update recruiter
    public Recruiter saveRecruiter(Recruiter recruiter) {
        return recruiterRepo.save(recruiter);
    }

    // Get all recruiters
    public List<Recruiter> getAllRecruiters() {
        return recruiterRepo.findAll();
    }

    // Get recruiter by ID
    public Optional<Recruiter> getRecruiterById(Long id) {
        return recruiterRepo.findById(id);
    }

    // Get recruiter by user_id
    public Optional<Recruiter> getRecruiterByUserId(Long userId) {
        return recruiterRepo.findByUserId(userId);
    }

    // Delete recruiter
    public void deleteRecruiter(Long id) {
        recruiterRepo.deleteById(id);
    }
}
