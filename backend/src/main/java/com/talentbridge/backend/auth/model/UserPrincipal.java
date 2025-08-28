package com.talentbridge.backend.auth.model;

import java.util.Collection;
import java.util.Collections;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

public class UserPrincipal implements UserDetails {

    private final Users user;

    public UserPrincipal(Users user) {
        this.user = user;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // Use role from Users entity if you have multiple roles
        return Collections.singleton(new SimpleGrantedAuthority(user.getRole() != null ? user.getRole() : "USER"));
    }

    @Override
    public String getPassword() {
        return user.getPassword();
    }

    @Override
    public String getUsername() {
        // Use email as login identifier
        return user.getEmail();
    }

    // Optional: expose Users object if needed elsewhere
    public Users getUser() {
        return user;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true; // Customize if needed
    }

    @Override
    public boolean isAccountNonLocked() {
        return true; // Customize if needed
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true; // Customize if needed
    }

    @Override
    public boolean isEnabled() {
        return true; // Customize if needed
    }
}
