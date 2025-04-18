// OrdersService.java
package com.be.service;

import com.be.entity.Orders;
import com.be.rep.OrdersRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class DashService {

    @Autowired
    private OrdersRepository ordersRepository;

    public long getTodayOrderCount() {
        return ordersRepository.countOrdersToday();
    }

    public List<Orders> getTodayOrders() {
        return ordersRepository.findTodayOrders();
    }
}