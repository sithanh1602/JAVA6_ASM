package com.be.service;

import com.be.DTO.OrderItem;
import com.be.DTO.OrderRequest;
import com.be.entity.*;
import com.be.rep.*;
import jakarta.mail.MessagingException;
import jakarta.persistence.criteria.Order;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.text.SimpleDateFormat;
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
    public List<Map<String, Object>> getAllOrdersWithDetails() throws Exception {
        List<Orders> orders = ordersRepository.findAll();
        List<Map<String, Object>> response = new ArrayList<>();

        for (Orders order : orders) {
            User user = order.getUser();
            List<Map<String, Object>> products = getProductsByOrderId(order.getId());

            Map<String, Object> orderInfo = new HashMap<>();
            orderInfo.put("id", order.getId());
            orderInfo.put("userName", user != null ? user.getFullName() : "Unknown");
            orderInfo.put("totalPrice", order.getTotalPrice());
            orderInfo.put("status", order.getStatus());
            orderInfo.put("orderDate", order.getOrderDate());
            orderInfo.put("products", products);

            response.add(orderInfo);
        }

        return response;
    }

    public List<Object[]> getOrderDetails(Date startDate, Date endDate) {
        return ordersRepository.getOrderDetails(startDate, endDate);
    }
    public Integer calculateRevenue(Date startDate, Date endDate) {
        Integer revenue = ordersRepository.calculateTotalRevenue(startDate, endDate);
        return revenue != null ? revenue : 0; // Ensure null safety
    }


    public List<Orders> getCompletedOrders(Date startDate, Date endDate) {
        return ordersRepository.findCompletedOrdersWithinPeriod(startDate, endDate);
    }

    public Map<Date, Integer> getRevenuePerDay(Date startDate, Date endDate) {
        List<Orders> completedOrders = ordersRepository.findCompletedOrdersWithinPeriod(startDate, endDate);

        return completedOrders.stream()
                .collect(Collectors.groupingBy(
                        Orders::getOrderDate,
                        Collectors.summingInt(Orders::getTotalPrice)
                ));
    }

    // Get daily revenue using the custom query
    public List<Object[]> getDailyRevenue(Date startDate, Date endDate) {
        return ordersRepository.calculateDailyRevenue(startDate, endDate);
    }
    public Orders updateOrderStatus(Long orderId, int status) {
        // Find the order by ID
        Orders order = ordersRepository.findById(orderId).orElseThrow(() -> new IllegalArgumentException("Order not found"));

        // Update the status
        order.setStatus(status);

        // Save the updated order to the database
        return ordersRepository.save(order);
    }



//    public void updateOrderStatus(Long orderId, int status) {
//        Orders order = ordersRepository.findById(orderId)
//                .orElseThrow(() -> new RuntimeException("Order not found"));
//
//        order.setStatus(status); // Đảm bảo trường `status` tồn tại trong entity Orders
//
//        ordersRepository.save(order);
//    }

    public Orders updateOrderStatushuy(Long orderId, Integer status) {
        // Tìm kiếm đơn hàng theo ID
        Orders order = ordersRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng với ID: " + orderId));
            order.setStatus(status);  // Cập nhật trạng thái đơn hàng
            // Thực hiện các thao tác khác nếu cần khi đơn hàng bị hủy (ví dụ, khôi phục lại số lượng hàng hóa)

            // Lưu đơn hàng với trạng thái đã thay đổi
            return ordersRepository.save(order);
    }





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
        System.out.println(orderRequest.getPaymentMethod());

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

        order.setPaymentStatus(true);
//        // Xác định trạng thái thanh toán (true: online, false: COD)
//        if ("bank".equals(orderRequest.getPaymentMethod())) {
//            order.setPaymentStatus(true); // Thanh toán online
//        } else {
//            order.setPaymentStatus(false); // Thanh toán COD
//        }
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
            if (newStock == 0) {
                product.setStatus("Out of Stock");
            }
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


        return savedOrder;
    }

    @Transactional
    public Orders saveOrdernovnpay(OrderRequest orderRequest) throws Exception {
        System.out.println("Received fullAddress: " + orderRequest.getFullAddress());
        System.out.println(orderRequest.getPaymentMethod());

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

        order.setPaymentStatus(false);
//        // Xác định trạng thái thanh toán (true: online, false: COD)
//        if ("bank".equals(orderRequest.getPaymentMethod())) {
//            order.setPaymentStatus(true); // Thanh toán online
//        } else {
//            order.setPaymentStatus(false); // Thanh toán COD
//        }
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
            if (newStock == 0) {
                product.setStatus("Out of Stock");
            }
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

    @Transactional
    public Orders createOrderPreview(OrderRequest orderRequest) throws Exception {
        // Kiểm tra dữ liệu đầu vào
        if (orderRequest.getUserId() == null) {
            throw new Exception("User ID is required");
        }

        // Tìm người dùng từ UserRepository
        Optional<User> userOptional = userRepository.findById(orderRequest.getUserId());
        if (!userOptional.isPresent()) {
            throw new Exception("User not found with ID: " + orderRequest.getUserId());
        }
        User user = userOptional.get();

        // Tìm đơn hàng từ OrderRepository
        Optional<Orders> existingOrder = ordersRepository.findById(orderRequest.getOrderId());
        if (!existingOrder.isPresent()) {
            throw new Exception("Order not found with ID: " + orderRequest.getOrderId());
        }
        Orders order = existingOrder.get();



        // Cập nhật tổng tiền đơn hàng
        order.setTotalPrice(orderRequest.getTotalPrice());  // Gắn lại tổng tiền từ frontend vào đơn hàng
        order.setStatus(2); // Trạng thái đơn hàng, có thể điều chỉnh
        order.setPaymentStatus(true);  // Thanh toán COD (tiền mặt khi nhận hàng)

        // Cập nhật ngày đặt hàng
        order.setOrderDate(new Date());

        // Không cần lưu lại vào cơ sở dữ liệu nữa
        // Chỉ cần trả về đơn hàng đã chỉnh sửa
        return order;
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
