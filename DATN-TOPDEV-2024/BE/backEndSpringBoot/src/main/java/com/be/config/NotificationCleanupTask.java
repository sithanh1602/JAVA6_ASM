package com.be.config;

import com.be.rep.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import java.time.LocalDateTime;

@Component
public class NotificationCleanupTask {

    @Autowired
    private NotificationRepository notificationRepository;

    // Chạy lúc 00:00 mỗi ngày
    @Scheduled(cron = "0 0 0 * * ?")
    public void cleanupOldNotifications() {
        LocalDateTime expiryDate = LocalDateTime.now().minusDays(7);
        notificationRepository.deleteExpiredNotifications(expiryDate);
        System.out.println("Đã xóa các thông báo cũ hơn 7 ngày: " + expiryDate);
    }
}
