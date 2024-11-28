package com.be.rep;

import com.be.entity.User;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    @Query("SELECT u FROM User u WHERE u.userName = ?1")
    Optional<User> findByUserName(String userName);

    Optional<User> findByEmail(String email);

    @Query("SELECT u FROM User u ORDER BY u.totalSpent DESC")
    List<User> findTopCustomers(Pageable pageable);
}
