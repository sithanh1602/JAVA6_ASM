package com.be.service;

import com.be.rep.RoleRepository;
import com.be.rep.UserRepository;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;

public class AuthServiceBuilder {
    private AuthenticationManager authenticationManager;
    private UserDetailsService userDetailsService;
    private UserRepository userRepository;
    private JwtTokenService jwtTokenService;
    private EmailValidationService emailValidationService;
    private PasswordEncoder passwordEncoder;
    private OtpService otpService;
    private EmailService emailService;
    private RoleRepository roleRepository;
    private GoogleIdTokenVerifier verifier;

    public AuthServiceBuilder setAuthenticationManager(AuthenticationManager authenticationManager) {
        this.authenticationManager = authenticationManager;
        return this;
    }

    public AuthServiceBuilder setUserDetailsService(UserDetailsService userDetailsService) {
        this.userDetailsService = userDetailsService;
        return this;
    }

    public AuthServiceBuilder setUserRepository(UserRepository userRepository) {
        this.userRepository = userRepository;
        return this;
    }

    public AuthServiceBuilder setJwtTokenService(JwtTokenService jwtTokenService) {
        this.jwtTokenService = jwtTokenService;
        return this;
    }

    public AuthServiceBuilder setEmailValidationService(EmailValidationService emailValidationService) {
        this.emailValidationService = emailValidationService;
        return this;
    }

    public AuthServiceBuilder setPasswordEncoder(PasswordEncoder passwordEncoder) {
        this.passwordEncoder = passwordEncoder;
        return this;
    }

    public AuthServiceBuilder setOtpService(OtpService otpService) {
        this.otpService = otpService;
        return this;
    }

    public AuthServiceBuilder setEmailService(EmailService emailService) {
        this.emailService = emailService;
        return this;
    }

    public AuthServiceBuilder setRoleRepository(RoleRepository roleRepository) {
        this.roleRepository = roleRepository;
        return this;
    }

    public AuthServiceBuilder setVerifier(GoogleIdTokenVerifier verifier) {
        this.verifier = verifier;
        return this;
    }


}