    package com.be.entity;

    import lombok.Data;

    import jakarta.persistence.*;
    import java.util.Date;

    @Entity
    @Table(name = "Orders")
    @Data // Lombok generates getters, setters, toString, equals, and hashCode methods
    public class Orders {

        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;

        @ManyToOne
        @JoinColumn(name = "user_id")
        private User user;

        @ManyToOne
        @JoinColumn(name = "voucher_id")
        private Voucher voucher;

        @Temporal(TemporalType.TIMESTAMP)
        private Date orderDate;

        private int totalPrice;

        private int status;


        @Column(name = "payment_status")
        private boolean paymentStatus;

        @Column(name = "full_address")
        private String fullAddress;

        @Column(name = "order_num")
        private String orderNum;

        private int shipping_fee;

        @Column(name = "discout_price")
        private int discountPrice;

        private String phone;

        @Column(name = "trans_id")
        private String trans_id;

        @Column(name = "return_order")
        private boolean return_order;

    }
