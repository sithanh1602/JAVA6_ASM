package com.be.controller;

import com.be.entity.Orders;
import com.be.entity.Product;
import com.be.entity.User;
import com.be.rep.OrdersRepository;
import com.be.service.DashService;
import com.be.service.ProductService;
import com.be.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.time.LocalDateTime;
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

}
