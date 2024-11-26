package com.be.rep;

import com.be.entity.Orders;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrdersRepository extends JpaRepository<Orders, Long> {
    List<Orders> findByUser_UserId(Long userId);  // Sử dụng 'user.userId' thay vì 'userId'
}
