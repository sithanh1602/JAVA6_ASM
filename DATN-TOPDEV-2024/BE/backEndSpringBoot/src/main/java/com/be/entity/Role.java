package com.be.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.springframework.security.core.GrantedAuthority;

@Entity
@Data
@Table(name = "role") // Ánh xạ tới bảng 'roles'
public class Role implements GrantedAuthority {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long roleId;

    @Column(name = "role_name", nullable = false)
    private String roleName;

    @Override
    public String getAuthority() {
        return roleName; // Trả về tên vai trò làm quyền hạn
    }


    public boolean isPresent() {
        return roleId != null;
    }

    public Role orElseThrow(Object o) {
        return (Role) o;
    }
}
