package com.be.rep;

import com.be.entity.Orders;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Date;
import java.util.List;
import java.util.Optional;

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


    @Query(value = "SELECT " +
            "o.id AS order_id, " +
            "u.full_name AS user_name, " +
            "p.name AS product_name, " +
            "od.quantity AS product_quantity, " +
            "od.price AS product_price, " +
            "(od.quantity * od.price) AS total_price_per_product, " +
            "SUM(od.quantity * od.price) OVER (PARTITION BY o.id) AS total_order_price " +
            "FROM order_detail od " +
            "JOIN Orders o ON od.order_id = o.id " +
            "JOIN Products p ON od.product_id = p.id " +
            "JOIN Users u ON o.user_id = u.id " +
            "WHERE o.order_date BETWEEN :startDate AND :endDate " +
            "ORDER BY o.id, p.name", nativeQuery = true)
    List<Object[]> getOrderDetails(Date startDate, Date endDate);

    @Query("SELECT MAX(CAST(SUBSTRING(o.orderNum, 3) AS LONG)) FROM Orders o")
    Long getMaxOrderNum();

    @Query("SELECT o FROM Orders o WHERE o.user.userId = :userId")
    List<Orders> findOrdersByUserId(@Param("userId") Long userId);

    List<Orders> findByStatus(int status);

    Optional<Orders> findByOrderNum(String orderNum);

}

