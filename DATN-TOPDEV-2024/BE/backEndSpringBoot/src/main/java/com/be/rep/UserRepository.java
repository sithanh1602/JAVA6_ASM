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

    // query dash
    @Query(value = """
        SELECT u.id AS userId, u.full_name AS fullName, u.image AS image, SUM(o.total_price) AS totalSpent
        FROM Users u
        JOIN Orders o ON u.id = o.user_id
        WHERE o.status = 8
        GROUP BY u.id, u.full_name, u.image
        ORDER BY totalSpent DESC
        """, nativeQuery = true)
    List<Object[]> findTop3Customers();

}
