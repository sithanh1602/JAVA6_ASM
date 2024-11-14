package com.be.seurity;

import com.be.entity.User;
import com.be.rep.UserRepository;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

@Service
public class SessionService {

    @Autowired
    HttpSession session;

    public <T> T get(String name) {
        return (T) session.getAttribute(name);
    }
    public void set(String name, Object value) {
        session.setAttribute(name, value);
    }
    public void remove(String name) {
        session.removeAttribute(name);
    }

    @Autowired
    private UserRepository userRepository;

    public Long getLoggedInUserId() {
        Long userId = (Long) session.getAttribute("userId");
        if (userId == null) {
            Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            String username = principal instanceof UserDetails ? ((UserDetails) principal).getUsername() : principal.toString();
            User user = userRepository.findByUserName(username).orElse(null);
            if (user != null) {
                userId = user.getUserId();
                session.setAttribute("userId", userId);  // Cache userId in session
            }
        }
        return userId;
    }

}
