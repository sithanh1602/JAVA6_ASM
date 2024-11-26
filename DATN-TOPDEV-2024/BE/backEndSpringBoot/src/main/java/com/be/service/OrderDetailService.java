package com.be.service;


import com.be.entity.OrderDetail;
import com.be.rep.OrderDetailRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class OrderDetailService {

    @Autowired
    private OrderDetailRepository orderDetailRepository;

    public OrderDetail saveOrderDetail(OrderDetail orderDetail) {
        return orderDetailRepository.save(orderDetail);
    }

    public List<OrderDetail> getAllOrderDetails() {
        return orderDetailRepository.findAll();
    }

    public OrderDetail getOrderDetailById(int id) {
        return orderDetailRepository.findById(id).orElse(null);
    }

    public void deleteOrderDetail(int id) {
        orderDetailRepository.deleteById(id);
    }
}
