package com.be.dto;

import lombok.Data;


@Data
public class ReviewDTO {
    private Long userId;
    private int orderDetailId;
    private int rating;
    private String comment;

}
