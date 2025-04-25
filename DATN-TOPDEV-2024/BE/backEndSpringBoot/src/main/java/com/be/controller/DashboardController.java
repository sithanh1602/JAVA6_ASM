package com.be.controller;

import com.be.entity.Orders;
import com.be.entity.Product;
import com.be.entity.User;
import com.be.rep.OrdersRepository;
import com.be.service.DashService;
import com.be.service.OrderService;
import com.be.service.ProductService;
import com.be.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dash")
public class DashboardController {

    @Autowired
    private UserService userService;

    @Autowired
    private ProductService productService;

    @Autowired
    private DashService dashService;
    @Autowired
    private OrdersRepository ordersRepository;

    // Endpoint to get the top 3 best-selling products
    @GetMapping("/top-selling")
    public List<Product> getTopSellingProducts() {
        return productService.getTop3BestSellingProducts();
    }

    @GetMapping("/top-customers")
    public ResponseEntity<List<User>> getTopCustomers() {
        List<User> topCustomers = userService.getTopCustomers(3); // lấy top 3 khách hàng
        return new ResponseEntity<>(topCustomers, HttpStatus.OK);
    }

    @GetMapping("/count-today")
    public ResponseEntity<Long> countTodayOrders() {
        return ResponseEntity.ok(dashService.getTodayOrderCount());
    }

    @GetMapping("/orders-today")
    public ResponseEntity<List<Orders>> getTodayOrders() {
        List<Orders> orders = dashService.getTodayOrders();
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/orders-by-date")
    public ResponseEntity<List<Orders>> getOrdersByDate(@RequestParam("date") String dateStr) {
        LocalDate date = LocalDate.parse(dateStr);
        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime endOfDay = date.plusDays(1).atStartOfDay();

        List<Orders> orders = ordersRepository.findByOrderDateBetween(startOfDay, endOfDay);
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/statistics")
    public ResponseEntity<BigDecimal> getTotalRevenueByDateRange(
            @RequestParam("from") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam("to") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate) {

        // chuyển LocalDate thành LocalDateTime
        LocalDateTime fromDateTime = fromDate.atStartOfDay();
        LocalDateTime toDateTime = toDate.plusDays(1).atStartOfDay();

        BigDecimal totalRevenue = ordersRepository.sumTotalPriceBetweenDates(fromDateTime, toDateTime);
        return ResponseEntity.ok(totalRevenue);
    }

    @GetMapping("/monthly-revenue")
    public ResponseEntity<List<Map<String, Object>>> getMonthlyRevenue(
            @RequestParam("from") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam("to") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate) {

        LocalDateTime fromDateTime = fromDate.atStartOfDay();
        LocalDateTime toDateTime = toDate.plusDays(1).atStartOfDay();

        List<Map<String, Object>> monthlyRevenue = dashService.getRevenueByMonth(fromDateTime, toDateTime);
        return ResponseEntity.ok(monthlyRevenue);
    }

    @GetMapping("/revenue/completed")
    public ResponseEntity<BigDecimal> getTotalRevenueOfCompletedOrders() {
        BigDecimal totalRevenue = ordersRepository.getTotalRevenueOfCompletedOrders();
        return ResponseEntity.ok(totalRevenue != null ? totalRevenue : BigDecimal.ZERO);
    }


    @Autowired
    private OrderService orderService;

    @GetMapping("/orders/status8")
    public ResponseEntity<List<Orders>> getOrdersByStatus(@RequestParam(required = false) Integer status) {
        if (status != null) {
            List<Orders> orders = orderService.getOrdersByStatus(status);
            return ResponseEntity.ok(orders);
        } else {
            // Trả về tất cả nếu không truyền status
            return ResponseEntity.ok(orderService.getOrdersByStatus(8)); // hoặc getAllOrders() nếu muốn
        }
    }

    @GetMapping("/orders/status8-range")
    public ResponseEntity<List<Orders>> getCompletedOrdersInRange(
            @RequestParam("fromDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Date fromDate,
            @RequestParam("toDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Date toDate) {

        List<Orders> orders = orderService.getCompletedOrdersInRange(fromDate, toDate);
        return ResponseEntity.ok(orders);
    }
}
