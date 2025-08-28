package com.talentbridge.backend.auth.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.talentbridge.backend.auth.Service.UserService;
import com.talentbridge.backend.auth.model.Users;

@RestController
public class UserController {
    @Autowired
    private UserService service;

    @PostMapping("/register")
    public Users registerUser(@RequestBody Users user) {
        System.err.println("Hitt");
        return service.saveUser(user);
    }
    @PostMapping("/login")
    public String login(@RequestBody Users user) {
        return service.verify(user);
    }
}

