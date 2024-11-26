package com.be.service;

import com.be.DTO.OrderItem;
import com.be.DTO.OrderRequest;
import com.be.entity.*;
import com.be.rep.*;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class OrderService {

    @Autowired
    private OrdersRepository ordersRepository;

    @Autowired
    private OrderDetailRepository orderDetailRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CartDetailRepository cartDetailRepository;

    @Autowired
    private EmailService emailService;


    public List<Orders> getOrdersByUserId(Long userId) {
        return ordersRepository.findByUser_UserId(userId);  // Sử dụng 'findByUser_UserId'
    }

    public List<Map<String, Object>> getProductsByOrderId(Long orderId) throws Exception {
        // Lấy danh sách chi tiết đơn hàng từ ID đơn hàng
        List<OrderDetail> orderDetails = orderDetailRepository.findByOrderId(orderId);
        if (orderDetails.isEmpty()) {
            throw new Exception("Không tìm thấy chi tiết đơn hàng cho ID: " + orderId);
        }

        // Trả về danh sách các sản phẩm kèm theo số lượng
        List<Map<String, Object>> productsWithQuantity = new ArrayList<>();
        for (OrderDetail orderDetail : orderDetails) {
            Product product = orderDetail.getProduct();
            Map<String, Object> productInfo = new HashMap<>();
            productInfo.put("name", product.getName());
            productInfo.put("imageUrl", product.getImageUrl());
            productInfo.put("quantity", orderDetail.getQuantity());
            productInfo.put("price", product.getPrice());
            productsWithQuantity.add(productInfo);
        }
        return productsWithQuantity;
    }



    @Transactional
    public Orders saveOrder(OrderRequest orderRequest) throws Exception {
        System.out.println("Received fullAddress: " + orderRequest.getFullAddress());

        if (orderRequest.getUserId() == null) {
            throw new Exception("User ID is required");
        }

        Optional<User> userOptional = userRepository.findById(orderRequest.getUserId());
        if (!userOptional.isPresent()) {
            throw new Exception("User not found with ID: " + orderRequest.getUserId());
        }
        User user = userOptional.get();

        Orders order = new Orders();
        order.setUser(user);
        order.setTotalPrice(orderRequest.getTotalPrice());
        order.setStatus(1);
        order.setFullAddress(orderRequest.getFullAddress());

        boolean isPaymentPending = "bank".equals(orderRequest.getPaymentMethod());
        order.setPaymentStatus(Boolean.parseBoolean(isPaymentPending ? "Waiting for payment" : "Paid"));
        order.setOrderDate(new Date());

        Orders savedOrder = ordersRepository.save(order);

        for (OrderItem item : orderRequest.getCartItems()) {
            Product product = productRepository.findById(item.getProductId())
                    .orElseThrow(() -> new Exception("Product not found"));

            // Trừ số lượng sản phẩm
            int newStock = product.getStock() - item.getQuantity();
            if (newStock < 0) {
                throw new Exception("Insufficient stock for product: " + product.getName());
            }
            product.setStock(newStock);
            productRepository.save(product);

            // Lưu chi tiết đơn hàng
            OrderDetail orderDetail = new OrderDetail();
            orderDetail.setOrder(savedOrder);
            orderDetail.setProduct(product);
            orderDetail.setQuantity(item.getQuantity());
            orderDetail.setPrice(BigDecimal.valueOf(item.getProductPrice()));

            orderDetailRepository.save(orderDetail);

            // Xóa mục khỏi CartDetail
            cartDetailRepository.deleteByUserIdAndProductId(orderRequest.getUserId(), item.getProductId());
        }

        // Gửi email xác nhận đơn hàng
        String emailContent = buildEmailContent(user, orderRequest);
        emailService.sendEmail(user.getEmail(), "Order Confirmation", emailContent);

        return savedOrder;
    }

    private String buildEmailContent(User user, OrderRequest orderRequest) {
        StringBuilder sb = new StringBuilder();
        sb.append("<html>");
        sb.append("<head>");
        sb.append("<style>");
        sb.append("body { font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; }");
        sb.append(".container { max-width: 800px; margin: 0 auto; padding: 20px; background-color: #ffffff; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); }");
        sb.append(".header { text-align: center; padding-bottom: 20px; }");
        sb.append(".header h2 { color: #4CAF50; }"); // Primary color
        sb.append(".order-details { margin-top: 20px; }");
        sb.append(".order-details th, .order-details td { padding: 12px; border: 1px solid #ddd; }");
        sb.append(".order-details th { background-color: #4CAF50; color: #ffffff; text-align: center; }"); // Primary color for header
        sb.append(".order-details td { background-color: #f9f9f9; text-align: center; }");
        sb.append(".order-summary { margin-top: 20px; text-align: right; font-weight: bold; font-size: 1.2em; }");
        sb.append(".order-summary h3 { color: red; }"); // Red color for total price
        sb.append("table { width: 80%; margin: 0 auto; }"); // Center the table
        sb.append("</style>");
        sb.append("</head>");
        sb.append("<body>");
        sb.append("<div class='container'>");
        sb.append("<div class='header'>");
        sb.append("<h2>Cảm ơn đã mua hàng ở Tech Mart</h2>");
        sb.append("</div>");
        sb.append("<p>Dear ").append(user.getFullName()).append(",</p>");
        sb.append("<p>Thank you for your order!</p>");
        sb.append("<div class='order-details'>");
        sb.append("<h3>Order Details</h3>");
        sb.append("<p><strong>Name:</strong> ").append(user.getFullName()).append("</p>");
        sb.append("<p><strong>Email:</strong> ").append(user.getEmail()).append("</p>");
        sb.append("<p><strong>Phone:</strong> ").append(user.getPhone()).append("</p>");
        sb.append("<p><strong>Address:</strong> ").append(orderRequest.getFullAddress()).append("</p>");
        sb.append("<table>");
        sb.append("<thead>");
        sb.append("<tr>");
        sb.append("<th>Product Name</th>");
        sb.append("<th>Quantity</th>");
        sb.append("<th>Price</th>");
        sb.append("</tr>");
        sb.append("</thead>");
        sb.append("<tbody>");

        String productList = orderRequest.getCartItems().stream()
                .map(item -> "<tr><td>" + item.getProductName() + "</td><td>" + item.getQuantity() + "</td><td>" + String.format("%,.0f", (double) item.getProductPrice()) + " VND</td></tr>")
                .collect(Collectors.joining());

        sb.append(productList);

        sb.append("</tbody>");
        sb.append("</table>");
        sb.append("</div>");
        sb.append("<div class='order-summary'>");
        sb.append("<h3>Total Price: ").append(String.format("%,.0f", (double) orderRequest.getTotalPrice())).append(" VND</h3>");
        sb.append("</div>");
        sb.append("<p>Best regards,</p>");
        sb.append("<p>Tech Mart</p>");
        sb.append("</div>");
        sb.append("</body>");
        sb.append("</html>");

        return sb.toString();
    }
}
