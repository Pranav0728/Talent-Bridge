package com.talentbridge.backend.userProfile.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.talentbridge.backend.userProfile.model.UserProfileModel;

import java.util.Optional;

@Repository
public interface UserProfileRepo extends JpaRepository<UserProfileModel, Long> {
    Optional<UserProfileModel> findByUser_Id(Long userId);
}
