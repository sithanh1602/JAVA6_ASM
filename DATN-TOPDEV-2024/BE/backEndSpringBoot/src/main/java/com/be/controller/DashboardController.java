package com.be.controller;

import com.be.entity.Product;
import com.be.entity.User;
import com.be.service.OrderService;
import com.be.service.ProductService;
import com.be.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

@RestController
@RequestMapping("/api/dash")
public class DashboardController {

    @Autowired
    private UserService userService;

    @Autowired
    private ProductService productService;

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
}
