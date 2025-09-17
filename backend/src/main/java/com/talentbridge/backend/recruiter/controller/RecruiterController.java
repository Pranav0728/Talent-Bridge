package com.talentbridge.backend.recruiter.controller;

import com.talentbridge.backend.recruiter.model.Recruiter;
import com.talentbridge.backend.recruiter.service.RecruiterService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/recruiters")
public class RecruiterController {

    @Autowired
    private RecruiterService recruiterService;

    // ✅ Create or Update Recruiter
    @PostMapping
    public ResponseEntity<Recruiter> createRecruiter(@RequestBody Recruiter recruiter) {

        Recruiter savedRecruiter = recruiterService.saveRecruiter(recruiter);
        return ResponseEntity.ok(savedRecruiter);
    }

    // ✅ Get All Recruiters
    @GetMapping
    public ResponseEntity<List<Recruiter>> getAllRecruiters() {
        return ResponseEntity.ok(recruiterService.getAllRecruiters());
    }

    // ✅ Get Recruiter by ID
    @GetMapping("/{id}")
    public ResponseEntity<Recruiter> getRecruiterById(@PathVariable Long id) {
        Optional<Recruiter> recruiter = recruiterService.getRecruiterById(id);
        return recruiter.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    // ✅ Get Recruiter by User ID
    @GetMapping("/user/{userId}")
    public ResponseEntity<Recruiter> getRecruiterByUserId(@PathVariable Long userId) {
        Optional<Recruiter> recruiter = recruiterService.getRecruiterByUserId(userId);
        return recruiter.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    // ✅ Delete Recruiter
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRecruiter(@PathVariable Long id) {
        recruiterService.deleteRecruiter(id);
        return ResponseEntity.noContent().build();
    }
}
