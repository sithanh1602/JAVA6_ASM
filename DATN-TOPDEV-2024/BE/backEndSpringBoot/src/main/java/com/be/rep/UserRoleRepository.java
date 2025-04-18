package com.be.rep;

import com.be.entity.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface UserRoleRepository extends JpaRepository<UserRole, Integer> {
    @Query(value = "SELECT r.role_name FROM user_role ur JOIN role r ON ur.role_id = r.id WHERE ur.user_id = :userId", nativeQuery = true)
    List<String> findRolesByUserId(@Param("userId") Long userId);
}
