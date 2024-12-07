package com.be.rep;

import com.be.entity.Orders;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Date;
import java.util.List;

public interface OrdersRepository extends JpaRepository<Orders, Long> {
    List<Orders> findByUser_UserId(Long userId);  // Sử dụng 'user.userId' thay vì 'userId'
    @Query("SELECT SUM(o.totalPrice) FROM Orders o WHERE o.orderDate BETWEEN :startDate AND :endDate AND o.status = 3")
    Integer calculateTotalRevenue(Date startDate, Date endDate);
    @Query("SELECT o FROM Orders o WHERE o.orderDate BETWEEN :startDate AND :endDate AND o.status = 3")
    List<Orders> findCompletedOrdersWithinPeriod(Date startDate, Date endDate);

    @Query("SELECT DATE(o.orderDate) AS date, SUM(o.totalPrice) AS Danh_Thu " +
            "FROM Orders o " +
            "WHERE o.orderDate BETWEEN :startDate AND :endDate AND o.status = 3 " +
            "GROUP BY DATE(o.orderDate) " +
            "ORDER BY DATE(o.orderDate)")
    List<Object[]> calculateDailyRevenue(Date startDate, Date endDate);
}

