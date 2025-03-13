package com.be.service;

import com.be.dto.OrderItem;
import com.be.dto.OrderRequest;
import com.be.entity.*;
import com.be.rep.*;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
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
    @Autowired
    private ProductVariantRepository productVariantRepository;
    @Autowired
    private VoucherRepository voucherRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private NotificationRepository notificationRepository;

    // Scheduler chạy mỗi giờ để kiểm tra và xóa đơn hàng trạng thái 2
    @Scheduled(fixedRate = 60 * 60 * 1000) // Chạy mỗi giờ (60 phút * 60 giây * 1000 ms)
    @Transactional
    public void cleanupUnpaidOrders() {
        // Lấy danh sách đơn hàng ở trạng thái 2 (Chưa thanh toán)
        List<Orders> unpaidOrders = ordersRepository.findByStatus(2);

        Date currentDate = new Date();
        for (Orders order : unpaidOrders) {
            long diffInMillies = currentDate.getTime() - order.getOrderDate().getTime();
            long diffInDays = diffInMillies / (1000 * 60 * 60 * 24); // Chuyển đổi sang ngày

            // Nếu đơn hàng đã quá 1 ngày
            if (diffInDays >= 1) {
                // Xóa các mục trong OrderDetail trước
                List<OrderDetail> orderDetails = orderDetailRepository.findByOrderId(order.getId());
                orderDetailRepository.deleteAll(orderDetails);

                // Xóa đơn hàng
                ordersRepository.delete(order);
            }
        }
    }

    @Transactional
    public List<Map<String, Object>> getAllOrdersWithDetails() throws Exception {
        List<Orders> orders = ordersRepository.findAll();
        List<Map<String, Object>> response = new ArrayList<>();

        for (Orders order : orders) {
            User user = order.getUser();
            List<Map<String, Object>> products = getProductsByOrderId(order.getId());

            Map<String, Object> orderInfo = new HashMap<>();
            orderInfo.put("id", order.getId());
            orderInfo.put("orderNum", order.getOrderNum());
            orderInfo.put("userName", user != null ? user.getFullName() : "Unknown");
            orderInfo.put("totalPrice", order.getTotalPrice());
            orderInfo.put("status", order.getStatus());
            orderInfo.put("paymentStatus", order.isPaymentStatus());
            orderInfo.put("orderDate", order.getOrderDate());
            orderInfo.put("products", products);
            orderInfo.put("shoping_Fee", order.getShipping_fee());
            orderInfo.put("voucher", order.getVoucher());
            orderInfo.put("fullAddress", order.getFullAddress());
            orderInfo.put("phone", order.getPhone());
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


    @Transactional
    public Orders updateOrderStatus(Long orderId, int status) {
        // Tìm đơn hàng theo ID
        Orders order = ordersRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));

        // Cập nhật trạng thái
        order.setStatus(status);

        // Lưu đơn hàng đã cập nhật
        Orders updatedOrder = ordersRepository.save(order);

        // Ánh xạ trạng thái thành mô tả
        String statusDescription = getStatusDescription(status);

        // Tạo và lưu thông báo
        Notification notification = new Notification();
        notification.setUser(updatedOrder.getUser());
        notification.setOrder(updatedOrder);
        notification.setContent("Đơn hàng " + updatedOrder.getOrderNum() +
                " của bạn đang ở trạng thái " + statusDescription);
        notificationRepository.save(notification);

        // Chuẩn bị dữ liệu gửi qua WebSocket
        Map<String, Object> message = new HashMap<>();
        message.put("orderId", updatedOrder.getId());
        message.put("orderNum", updatedOrder.getOrderNum());
        message.put("status", updatedOrder.getStatus());
        message.put("userId", updatedOrder.getUser().getUserId());

        // Gửi thông báo qua WebSocket
        messagingTemplate.convertAndSend("/topic/status", message);

        return updatedOrder;
    }

    // Hàm ánh xạ trạng thái thành mô tả
    public String getStatusDescription(int status) {
        switch (status) {
            case 1: return "Đã đặt hàng";
            case 2: return "Chưa thanh toán";
            case 3: return "Đã thanh toán";
            case 4: return "Đã xác nhận";
            case 5: return "Đang giao hàng";
            case 6: return "Đã hoàn thành";
            case 7: return "Đã hủy";
            default: return "Không xác định";
        }
    }



//    public void updateOrderStatus(Long orderId, int status) {
//        Orders order = ordersRepository.findById(orderId)
//                .orElseThrow(() -> new RuntimeException("Order not found"));
//
//        order.setStatus(status); // Đảm bảo trường `status` tồn tại trong entity Orders
//
//        ordersRepository.save(order);
//    }


    public Orders getOrderById(Long orderId) {
        return ordersRepository.findById(orderId)
                .orElseThrow();
    }

    public Orders updateOrderStatushuy(Long orderId, Integer status) {
        // Tìm kiếm đơn hàng theo ID
        Orders order = ordersRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng với ID: " + orderId));
            order.setStatus(status);  // Cập nhật trạng thái đơn hàng
            return ordersRepository.save(order);
    }

    public List<Orders> getOrdersByUserId(Long userId) {
        return ordersRepository.findOrdersByUserId(userId);
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
            ProductVariant productVariant = orderDetail.getProduct_variant_id();

            // Lấy danh sách hình ảnh của biến thể sản phẩm
            List<Image> images = productVariant.getImages();
            String imageUrl = (images != null && !images.isEmpty()) ? images.get(0).getImage() : null;

            Map<String, Object> productInfo = new HashMap<>();
            productInfo.put("name", productVariant.getNameVariants()); // Lấy tên của ProductVariant
            productInfo.put("imageUrl", imageUrl); // Gán ảnh đầu tiên của ProductVariant
            productInfo.put("quantity", orderDetail.getQuantity());
            productInfo.put("price", productVariant.getPrice());
            productInfo.put("OrderDetailId",orderDetail.getId());

            productsWithQuantity.add(productInfo);
        }
        return productsWithQuantity;
    }


    public String generateOrderNum() {
        // Lấy số lượng đơn hàng hiện tại trong cơ sở dữ liệu
        Long maxOrderNum = ordersRepository.getMaxOrderNum();

        // Tạo số tiếp theo từ số lớn nhất
        long newOrderNum = (maxOrderNum != null ? maxOrderNum + 1 : 1);

        // Định dạng orderNum bắt đầu bằng "DH" và theo sau là số
        return "DH" + String.format("%05d", newOrderNum);  // Đảm bảo số luôn có 5 chữ số, ví dụ: DH00001
    }


    @Transactional
    public Orders saveOrder(OrderRequest orderRequest) throws Exception {
        // Kiểm tra User ID
        if (orderRequest.getUserId() == null) {
            throw new IllegalArgumentException("User ID is required");
        }

        // Tìm người dùng
        User user = userRepository.findById(orderRequest.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + orderRequest.getUserId()));

        // Tạo orderNum không trùng lặp
        String orderNum = generateOrderNum();

        // Tạo đơn hàng
        Orders order = new Orders();
        order.setOrderNum(orderNum);
        order.setUser(user);
        order.setTotalPrice(orderRequest.getTotalPrice());
        order.setStatus(2);  // Đơn hàng mới
        order.setFullAddress(orderRequest.getFullAddress());
        order.setPaymentStatus(true); // Trạng thái thanh toán là thành công
        order.setOrderDate(new Date());
        order.setPhone(orderRequest.getPhone());
        order.setShipping_fee(orderRequest.getShippingFee());

        // Kiểm tra xem có sử dụng voucher không
        if (orderRequest.getvoucherCode() != null && !orderRequest.getvoucherCode().isEmpty()) {
            // Tìm voucher theo mã
            Voucher voucher = voucherRepository.findByCode(orderRequest.getvoucherCode())
                    .orElseThrow(() -> new IllegalArgumentException("Voucher not found with code: " + orderRequest.getvoucherCode()));

            // Gán voucher cho order
            order.setVoucher(voucher);

            // Kiểm tra số lượng voucher còn lại
            if (voucher.getQuantity() <= 0) {
                throw new IllegalArgumentException("Voucher has been fully redeemed");
            }

            // Trừ số lượng voucher khi đã sử dụng
            voucher.setQuantity(voucher.getQuantity() - 1);
            voucherRepository.save(voucher);
        }

        // Đặt giá trị giảm giá từ orderRequest (không lấy trực tiếp từ voucher)
        if (orderRequest.getvoucherDiscount() != 0) {
            order.setDiscountPrice(orderRequest.getvoucherDiscount());
        } else {
            order.setDiscountPrice(0); // Nếu không có giảm giá, để 0
        }

        Orders savedOrder = ordersRepository.save(order);

        // Kiểm tra các OrderItem
        for (OrderItem item : orderRequest.getCartItems()) {
            // Kiểm tra ProductVariant ID
            if (item.getProductVariantId() == null) {
                throw new IllegalArgumentException("Product variant ID is required for product: " + item.getProductVariantId());
            }

            // Lấy thông tin ProductVariant
            ProductVariant productVariant = productVariantRepository.findById(item.getProductVariantId())
                    .orElseThrow(() -> new IllegalArgumentException("Product variant not found with ID: " + item.getProductVariantId()));

            // Kiểm tra số lượng kho và trừ số lượng
            int newStock = productVariant.getQuantity() - item.getQuantity();
            if (newStock < 0) {
                throw new IllegalArgumentException("Insufficient stock for product variant: " + productVariant.getProduct().getName());
            }
            productVariant.setQuantity(newStock);

            if (newStock == 0) {
                productVariant.setStatus("Out of Stock");
            }
            productVariantRepository.save(productVariant);

            // Lấy sản phẩm chính (Product)
            Product product = productVariant.getProduct();

            // Cập nhật số lượng tồn kho và số lượng mua
            product.setStock(product.getStock() - item.getQuantity());
            product.setPurchaseCount(product.getPurchaseCount() + item.getQuantity());

            // Kiểm tra tồn kho của sản phẩm chính
            if (product.getStock() <= 0) {
                product.setStatus("Out of Stock");
            }
            productRepository.save(product);

            // Lưu chi tiết đơn hàng
            OrderDetail orderDetail = new OrderDetail();
            orderDetail.setOrder(savedOrder);
            orderDetail.setProduct_variant_id(productVariant); // Liên kết ProductVariant
            orderDetail.setQuantity(item.getQuantity());
            orderDetail.setPrice(BigDecimal.valueOf(item.getProductPrice()));

            orderDetailRepository.save(orderDetail);

            // Xóa mục khỏi CartDetail
            cartDetailRepository.deleteByUserIdAndProductId(orderRequest.getUserId(), item.getProductVariantId());
        }

        return savedOrder;
    }



    // Hàm để sinh số đơn hàng (có thể điều chỉnh để phù hợp với yêu cầu)
    private String generateOrderNumber() {
        return "ORD-" + System.currentTimeMillis(); // Sinh số đơn hàng đơn giản bằng timestamp
    }




    @Transactional
    public Orders saveOrdernovnpay(OrderRequest orderRequest) throws Exception {
        // Kiểm tra User ID
        if (orderRequest.getUserId() == null) {
            throw new IllegalArgumentException("User ID is required");
        }

        // Tìm người dùng
        User user = userRepository.findById(orderRequest.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + orderRequest.getUserId()));

        // Tạo orderNum không trùng lặp
        String orderNum = generateOrderNum();

        // Tạo đơn hàng
        Orders order = new Orders();
        order.setOrderNum(orderNum);
        order.setUser(user);
        order.setTotalPrice(orderRequest.getTotalPrice());
        order.setStatus(1);  // Đơn hàng mới
        order.setFullAddress(orderRequest.getFullAddress());
        order.setPaymentStatus(false); // Trạng thái thanh toán là thành công
        order.setOrderDate(new Date()); // Ngày tạo đơn hàng
        order.setPhone(orderRequest.getPhone());
        order.setShipping_fee(orderRequest.getShippingFee());

        // Kiểm tra xem có sử dụng voucher không
        if (orderRequest.getvoucherCode() != null && !orderRequest.getvoucherCode().isEmpty()) {
            // Tìm voucher theo mã
            Voucher voucher = voucherRepository.findByCode(orderRequest.getvoucherCode())
                    .orElseThrow(() -> new IllegalArgumentException("Voucher not found with code: " + orderRequest.getvoucherCode()));

            // Kiểm tra số lượng voucher còn lại
            if (voucher.getQuantity() <= 0) {
                throw new IllegalArgumentException("Voucher has been fully redeemed");
            }

            // Trừ số lượng voucher khi đã sử dụng
            voucher.setQuantity(voucher.getQuantity() - 1);
            voucherRepository.save(voucher);
        }

        // Đặt giá trị giảm giá từ orderRequest (không lấy trực tiếp từ voucher)
        if (orderRequest.getvoucherDiscount() != 0) {
            order.setDiscountPrice(orderRequest.getvoucherDiscount());
        } else {
            order.setDiscountPrice(0); // Nếu không có giảm giá, để 0
        }

        Orders savedOrder = ordersRepository.save(order);

        // Kiểm tra các OrderItem
        for (OrderItem item : orderRequest.getCartItems()) {
            // Kiểm tra ProductVariant ID
            if (item.getProductVariantId() == null) {
                throw new IllegalArgumentException("Product variant ID is required for product: " + item.getProductVariantId());
            }

            // Lấy thông tin ProductVariant
            ProductVariant productVariant = productVariantRepository.findById(item.getProductVariantId())
                    .orElseThrow(() -> new IllegalArgumentException("Product variant not found with ID: " + item.getProductVariantId()));

            // Kiểm tra số lượng kho và trừ số lượng
            int newStock = productVariant.getQuantity() - item.getQuantity();
            if (newStock < 0) {
                throw new IllegalArgumentException("Insufficient stock for product variant: " + productVariant.getProduct().getName());
            }
            productVariant.setQuantity(newStock);

            // Nếu số lượng còn lại là 0, thay đổi trạng thái thành "Out of Stock"
            if (newStock == 0) {
                productVariant.setStatus("Out of Stock");
            }
            productVariantRepository.save(productVariant);

            // Lấy sản phẩm chính (Product)
            Product product = productVariant.getProduct();

            // Cập nhật số lượng tồn kho và số lượng mua
            product.setStock(product.getStock() - item.getQuantity());
            product.setPurchaseCount(product.getPurchaseCount() + item.getQuantity());

            // Kiểm tra tồn kho của sản phẩm chính
            if (product.getStock() <= 0) {
                product.setStatus("Out of Stock");
            }
            productRepository.save(product);

            // Lưu chi tiết đơn hàng
            OrderDetail orderDetail = new OrderDetail();
            orderDetail.setOrder(savedOrder);
            orderDetail.setProduct_variant_id(productVariant); // Liên kết ProductVariant
            orderDetail.setQuantity(item.getQuantity());
            orderDetail.setPrice(BigDecimal.valueOf(item.getProductPrice()));

            orderDetailRepository.save(orderDetail);

            // Xóa mục khỏi CartDetail
            cartDetailRepository.deleteByUserIdAndProductId(orderRequest.getUserId(), item.getProductVariantId());
        }
        // Gửi email xác nhận đơn hàng
        String emailContent = buildEmailContent(user, orderRequest);
        emailService.sendEmail(user.getEmail(), "Order Confirmation", emailContent);

        return savedOrder;
    }

    public Orders createOrderPreview(OrderRequest orderRequest) throws Exception {
        System.out.println("🔍 Debug OrderRequest: " + orderRequest);
        System.out.println("🔹 userId: " + orderRequest.getUserId());
        System.out.println("🔹 orderId: " + orderRequest.getOrderId());

        if (orderRequest.getOrderId() == null) {
            throw new Exception("❌ Lỗi: Order ID không được để trống!");
        }
        if (orderRequest.getUserId() == null) {
            throw new Exception("❌ Lỗi: User ID không được để trống!");
        }

        Optional<User> userOptional = userRepository.findById(orderRequest.getUserId());
        if (!userOptional.isPresent()) {
            throw new Exception("❌ Không tìm thấy User với ID: " + orderRequest.getUserId());
        }

        Optional<Orders> existingOrder = ordersRepository.findById(orderRequest.getOrderId());
        if (!existingOrder.isPresent()) {
            throw new Exception("❌ Không tìm thấy Order với ID: " + orderRequest.getOrderId());
        }

        Orders order = existingOrder.get();
        order.setTotalPrice(orderRequest.getTotalPrice());
        order.setStatus(2);
        order.setPaymentStatus(true);
        order.setOrderDate(new Date());

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
