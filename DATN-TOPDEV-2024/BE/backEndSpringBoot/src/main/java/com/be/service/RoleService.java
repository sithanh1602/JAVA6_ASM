package com.be.service;

import com.be.entity.Role;
import com.be.rep.RoleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class RoleService {
    @Autowired
    private RoleRepository roleRepository;

    public void initRoles() {
        Role userRole = new Role();
        userRole.setRoleName("USER");
        roleRepository.save(userRole); // Lưu vai trò USER vào cơ sở dữ liệu

        Role adminRole = new Role();
        adminRole.setRoleName("ADMIN");
        roleRepository.save(adminRole); // Lưu vai trò ADMIN vào cơ sở dữ liệu
    }
}
