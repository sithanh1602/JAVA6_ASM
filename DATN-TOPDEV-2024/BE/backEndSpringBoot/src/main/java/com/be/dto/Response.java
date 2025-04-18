package com.be.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class Response<T> {
    private String status;
    private T data;
    private String message;

    public static <T> Response<T> success(T data, String message) {
        return new Response<>("success", data, message);
    }

    public static <T> Response<T> error(String message) {
        return new Response<>("error", null, message);
    }
}