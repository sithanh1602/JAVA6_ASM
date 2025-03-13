package com.be.rep;


import com.be.entity.Notification;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUserUserId(Long userId);
    @Transactional
    @Modifying
    @Query("DELETE FROM Notification n WHERE n.createdAt <= :expiryDate")
    void deleteExpiredNotifications(@Param("expiryDate") LocalDateTime expiryDate);
}
