package com.be.GeminiClientdto;

import lombok.Data;

@Data
public class CompatibleComponentRequest {
    private String selectedComponentType;
    private int selectedProductId;
    private int selectedVariantId;
    private String usagePurpose;
    private double budget;
    private Object currentBuild;
}
