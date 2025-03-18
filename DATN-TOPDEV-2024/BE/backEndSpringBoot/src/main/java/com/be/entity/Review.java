package com.be.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.util.Date;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Data
@Table(name = "Reviews")
public class Review {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "order_detail_id", nullable = false)
    private OrderDetail orderDetail;

    @Column(name = "rating")
    private int rating;

    @Column(name = "comment")
    private String comment;


    @Temporal(TemporalType.TIMESTAMP)
    private Date createAt;
}
