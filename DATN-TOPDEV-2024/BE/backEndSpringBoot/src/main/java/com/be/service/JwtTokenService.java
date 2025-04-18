package com.be.service;

import com.be.entity.User;
import com.nimbusds.jose.*;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.List;
import java.time.temporal.ChronoUnit;

@Service
public class JwtTokenService {
    private static final Logger logger = LoggerFactory.getLogger(JwtTokenService.class);
    @Value("${jwt.secret}")
    private String SIGNER_KEY;
    private final long expirationTime = 1000 * 60 * 60 * 11; // 11 hours


    public String generateToken(User user, List<String> roles) {
        try {
            // Bước 1: Tạo Header
            JWSHeader header = new JWSHeader.Builder(JWSAlgorithm.HS512)
                    .type(JOSEObjectType.JWT)
                    .build();

            // Bước 2: Tạo Payload
            JWTClaimsSet claimsSet = new JWTClaimsSet.Builder()
                    .subject(user.getUserName())
                    .claim("userId", user.getUserId())
                    .claim("roles", roles)
                    .claim("phone", user.getPhone())
                    .issueTime(new Date())
                    .expirationTime(new Date(Instant.now().plus(expirationTime, ChronoUnit.MILLIS).toEpochMilli()))
                    .build();

            // Bước 3: Tạo JWS Object
            Payload payload = new Payload(claimsSet.toJSONObject());
            JWSObject jwsObject = new JWSObject(header, payload);

            // Bước 4: Ký token
            jwsObject.sign(new MACSigner(SIGNER_KEY.getBytes(StandardCharsets.UTF_8)));

            // Bước 5: Serialize thành token
            return jwsObject.serialize();
        } catch (JOSEException e) {
            logger.error("Failed to generate token for user {}: {}", user.getUserName(), e.getMessage());
            throw new RuntimeException("Failed to generate token", e);
        }
    }

    public JWTClaimsSet extractClaims(String token) {
        try {
            SignedJWT signedJWT = SignedJWT.parse(token);
            if (!signedJWT.verify(new MACVerifier(SIGNER_KEY.getBytes(StandardCharsets.UTF_8)))) {
                throw new RuntimeException("Invalid token signature");
            }
            return signedJWT.getJWTClaimsSet();
        } catch (Exception e) {
            logger.warn("Failed to extract claims: {}", e.getMessage());
            throw new RuntimeException("Invalid or expired token", e);
        }
    }

    public String extractUsername(String token) {
        try {
            JWTClaimsSet claims = extractClaims(token);
            return claims.getSubject();
        } catch (Exception e) {
            logger.warn("Failed to extract username: {}", e.getMessage());
            return null;
        }
    }

    public boolean isTokenExpired(String token) {
        try {
            JWTClaimsSet claims = extractClaims(token);
            Date expiration = claims.getExpirationTime();
            return expiration != null && expiration.before(new Date());
        } catch (Exception e) {
            logger.warn("Failed to check token expiration: {}", e.getMessage());
            return true;
        }
    }

    public boolean validateToken(String token, String username) {
        try {
            String tokenUsername = extractUsername(token);
            return tokenUsername != null && tokenUsername.equals(username) && !isTokenExpired(token);
        } catch (Exception e) {
            logger.warn("Token validation failed: {}", e.getMessage());
            return false;
        }
    }
}