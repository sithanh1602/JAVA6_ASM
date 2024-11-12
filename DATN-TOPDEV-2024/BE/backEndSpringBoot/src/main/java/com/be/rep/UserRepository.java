package com.be.rep;

import com.be.entity.User;
import org.springframework.data.jdbc.repository.query.Query;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    @Query("select u from [user] u where u.userName = ?1")
    Optional<User> findByUserName(String userName);

    Optional<User> findByEmail(String email); // Thêm phương thức này để tìm kiếm email

}
