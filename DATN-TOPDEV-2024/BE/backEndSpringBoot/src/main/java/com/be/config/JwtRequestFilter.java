package com.be.config;

import com.be.service.UserDetailsServiceImpl;
import com.be.utills.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;

@Component
public class JwtRequestFilter extends OncePerRequestFilter {

    @Autowired
    private UserDetailsServiceImpl userDetailsService;

    @Autowired
    private JwtUtil jwtUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        // Lấy Authorization header từ request
        final String authorizationHeader = request.getHeader("Authorization");

        String jwt = null;
        String username = null;

        // Kiểm tra Authorization header
        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            jwt = authorizationHeader.substring(7); // Loại bỏ "Bearer "
            try {
                username = jwtUtil.extractUsername(jwt); // Trích xuất username từ token
            } catch (Exception e) {
                logger.warn("Không thể trích xuất username từ token: " + e.getMessage());
            }
        } else if (authorizationHeader != null) {
            logger.warn("Authorization header không đúng định dạng (phải bắt đầu bằng 'Bearer ')");
        }

        // Xử lý nếu username hợp lệ và chưa được xác thực trong SecurityContext
        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            // Lấy thông tin người dùng từ UserDetailsService
            UserDetails userDetails = userDetailsService.loadUserByUsername(username);

            // Xác minh token hợp lệ
            if (jwtUtil.validateToken(jwt, userDetails.getUsername())) {
                System.out.println();
                UsernamePasswordAuthenticationToken authenticationToken =
                        new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                authenticationToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                // Gán xác thực vào SecurityContext
                SecurityContextHolder.getContext().setAuthentication(authenticationToken);
            } else {
                logger.warn("Token không hợp lệ hoặc đã hết hạn");
            }
        }

        // Tiếp tục chuỗi filter
        chain.doFilter(request, response);
    }
}