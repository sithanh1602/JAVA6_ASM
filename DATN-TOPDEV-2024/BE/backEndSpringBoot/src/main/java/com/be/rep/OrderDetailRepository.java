package com.be.rep;

import com.be.entity.OrderDetail;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderDetailRepository extends JpaRepository<OrderDetail, Integer> {
    // Tạo phương thức truy vấn đơn hàng theo orderId
    List<OrderDetail> findByOrderId(Long orderId);
}
