package com.talentbridge.backend.auth.Service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.talentbridge.backend.auth.Exceptions.EmailAlreadyExistsException;
import com.talentbridge.backend.auth.model.Users;
import com.talentbridge.backend.auth.repo.UserRepo;


@Service
public class UserService {
    @Autowired
    private UserRepo repo;

    @Autowired
    private JWTService jwtService;

    @Autowired
    AuthenticationManager authManager;

    private BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    public Users saveUser(Users user) {
        if (repo.existsByEmail(user.getEmail())) {
        throw new EmailAlreadyExistsException("Email already exists");
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return repo.save(user);
    }
    public String verify(Users user) {
        Authentication authentication = authManager.authenticate(new UsernamePasswordAuthenticationToken(user.getEmail(), user.getPassword()));
   if (authentication.isAuthenticated()) {

        String role = repo.findByEmail(user.getEmail()).getRole();
        Long id = repo.findByEmail(user.getEmail()).getId();
        return jwtService.generateToken(user.getEmail(), role, id)  ;
        } else {
            return "fail";
        }
    }
}
