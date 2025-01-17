package com.be.DTO;

import com.be.rep.AddressRepository;
import com.be.rep.UserRepository;

import com.be.utills.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class SessionService {

    @Autowired
    private HttpSession session;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AddressRepository addressRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private HttpServletRequest request;

    // Generic method to retrieve session attribute
    public <T> T get(String name) {
        return (T) session.getAttribute(name);
    }

}
