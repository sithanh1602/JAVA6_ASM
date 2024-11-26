package com.be.utills;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.List;

@Component
public class JwtUtil {
    // Tạo khóa bảo mật đủ mạnh
    private final SecretKey secretKey = Keys.secretKeyFor(SignatureAlgorithm.HS256);
    private final long expirationTime = 1000 * 60 * 60 * 11; // 11 giờ

    public String generateToken(String username, List<String> roles, long userId) {
        return Jwts.builder()
                .setSubject(username)
                .claim("roles", roles) // Thêm roles vào token
                .claim("userId", userId)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + expirationTime))
                .signWith(secretKey)
                .compact();
    }

    public Claims extractClaims(String token) {
        try {
            return Jwts.parserBuilder()
                    .setSigningKey(secretKey)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
        } catch (Exception e) {
            // Nếu token không hợp lệ, trả về null
            return null;
        }
    }

    public String extractUsername(String token) {
        Claims claims = extractClaims(token);
        if (claims != null) {
            return claims.getSubject();
        }
        return null; // Trả về null nếu không thể giải mã token
    }

    public boolean isTokenExpired(String token) {
        Claims claims = extractClaims(token);
        if (claims != null) {
            return claims.getExpiration().before(new Date());
        }
        return true; // Nếu không thể giải mã token, coi như token đã hết hạn
    }

    public boolean validateToken(String token, String username) {
        String tokenUsername = extractUsername(token);
        // Kiểm tra nếu token hợp lệ và không hết hạn
        return (tokenUsername != null && tokenUsername.equals(username) && !isTokenExpired(token));
    }
}
