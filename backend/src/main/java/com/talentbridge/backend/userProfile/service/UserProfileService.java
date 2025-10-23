package com.talentbridge.backend.userProfile.service;

import com.talentbridge.backend.auth.model.Users;
import com.talentbridge.backend.userProfile.repo.UsersRepository;

import com.talentbridge.backend.userProfile.model.UserProfileModel;
import com.talentbridge.backend.userProfile.repo.UserProfileRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserProfileService {

    @Autowired
    private UserProfileRepo userProfileRepo;

    @Autowired
    private UsersRepository usersRepository;

    // ---------------- Create Profile ----------------
    public UserProfileModel createProfile(Long userId, UserProfileModel profileData) {
        Users user = usersRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));

        profileData.setUser(user); // link foreign key
        return userProfileRepo.save(profileData);
    }

    // ---------------- Get All Profiles ----------------
    public List<UserProfileModel> getAllProfiles() {
        return userProfileRepo.findAll();
    }

    // ---------------- Get Profile by ID ----------------
    public UserProfileModel getProfileById(Long id) {
        return userProfileRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Profile not found with ID: " + id));
    }

    // ---------------- Get Profile by User ID ----------------
    public UserProfileModel getProfileByUserId(Long userId) {
        return userProfileRepo.findByUser_Id(userId)
                .orElseThrow(() -> new RuntimeException("Profile not found for user ID: " + userId));
    }

    // ---------------- Update Profile ----------------
    public UserProfileModel updateProfile(Long id, UserProfileModel updatedProfile) {
        UserProfileModel existing = getProfileById(id);

        // Basic Info
        existing.setFirstName(updatedProfile.getFirstName());
        existing.setLastName(updatedProfile.getLastName());
        existing.setEmail(updatedProfile.getEmail());
        existing.setPhoneNumber(updatedProfile.getPhoneNumber());
        existing.setProfilePicture(updatedProfile.getProfilePicture());

        // Professional Info
        existing.setHeadline(updatedProfile.getHeadline());
        existing.setCurrentCompany(updatedProfile.getCurrentCompany());
        existing.setExperienceLevel(updatedProfile.getExperienceLevel());
        existing.setJobTitle(updatedProfile.getJobTitle());
        existing.setJobDescription(updatedProfile.getJobDescription());

        // Skills (ElementCollection handling)
        existing.getSkills().clear();
        if (updatedProfile.getSkills() != null) {
            existing.getSkills().addAll(updatedProfile.getSkills());
        }

        // Career Info
        existing.setIndustry(updatedProfile.getIndustry());
        existing.setLocation(updatedProfile.getLocation());

        // Optional Links
        existing.setResume(updatedProfile.getResume());
        existing.setLinkedinUrl(updatedProfile.getLinkedinUrl());
        existing.setPortfolioUrl(updatedProfile.getPortfolioUrl());
        existing.setGithubUrl(updatedProfile.getGithubUrl());

        return userProfileRepo.save(existing);
    }

    // ---------------- Delete Profile ----------------
    public void deleteProfile(Long id) {
        if (!userProfileRepo.existsById(id)) {
            throw new RuntimeException("Profile not found with ID: " + id);
        }
        userProfileRepo.deleteById(id);
    }
}
