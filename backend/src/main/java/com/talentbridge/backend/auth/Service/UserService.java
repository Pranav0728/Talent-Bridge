package com.talentbridge.backend.auth.Service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

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
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return repo.save(user);
    }
    public String verify(Users user) {
        Authentication authentication = authManager.authenticate(new UsernamePasswordAuthenticationToken(user.getEmail(), user.getPassword()));
   if (authentication.isAuthenticated()) {
         return jwtService.generateToken(user.getEmail())  ;
        } else {
            return "fail";
        }
    }
}
