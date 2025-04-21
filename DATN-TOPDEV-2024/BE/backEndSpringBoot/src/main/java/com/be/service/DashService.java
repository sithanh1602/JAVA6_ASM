// OrdersService.java
package com.be.service;

import com.be.entity.Orders;
import com.be.rep.OrdersRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.Month;
import java.time.format.TextStyle;
import java.util.*;

@Service
public class DashService {

    @Autowired
    private OrdersRepository ordersRepository;

    @PersistenceContext
    private EntityManager entityManager;

    public long getTodayOrderCount() {
        return ordersRepository.countOrdersToday();
    }

    public List<Orders> getTodayOrders() {
        return ordersRepository.findTodayOrders();
    }

    public List<Map<String, Object>> getRevenueByMonth(LocalDateTime fromDate, LocalDateTime toDate) {
        // Sử dụng native query tương thích với SQL Server
        String sql = "SELECT YEAR(order_date) as year, " +
                "MONTH(order_date) as month, " +
                "SUM(total_price) as revenue " +
                "FROM orders " +
                "WHERE order_date BETWEEN ?1 AND ?2 " +
                "AND status = 8 " +  // chỉ lấy đơn đã hoàn thành
                "GROUP BY YEAR(order_date), MONTH(order_date) " +
                "ORDER BY year, month";


        List<Object[]> results = entityManager.createNativeQuery(sql)
                .setParameter(1, fromDate)
                .setParameter(2, toDate)
                .getResultList();

        List<Map<String, Object>> monthlyRevenue = new ArrayList<>();
        for (Object[] row : results) {
            Map<String, Object> monthData = new HashMap<>();
            int year = ((Number) row[0]).intValue();
            int month = ((Number) row[1]).intValue();

            // Xử lý kết quả revenue một cách linh hoạt hơn
            Number revenueNumber = (Number) row[2];
            BigDecimal revenue;

            if (revenueNumber instanceof BigDecimal) {
                revenue = (BigDecimal) revenueNumber;
            } else {
                // Chuyển đổi các kiểu số khác sang BigDecimal
                revenue = new BigDecimal(revenueNumber.toString());
            }

            monthData.put("yearMonth", year + "-" + String.format("%02d", month));
            monthData.put("month", getMonthName(month));
            monthData.put("revenue", revenue);
            monthlyRevenue.add(monthData);
        }

        return monthlyRevenue;
    }

    private String getMonthName(int month) {
        return Month.of(month).getDisplayName(TextStyle.FULL, new Locale("vi"));
    }
}