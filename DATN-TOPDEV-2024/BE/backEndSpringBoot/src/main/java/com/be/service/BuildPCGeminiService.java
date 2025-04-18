package com.be.service;

import com.be.GeminiClientdto.AttributeDTO;
import com.be.GeminiClientdto.FullProductDTO;
import com.be.GeminiClientdto.ProductVariantsDTO;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.util.EntityUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BuildPCGeminiService {

    private final String apiKey = "AIzaSyDhAbhPJg47Q4bwkU3NcbNuoQLwKdN7YvY";
    private final String apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Autowired
    private ProductService productService;

    private String productsToString(List<FullProductDTO> products) {
        StringBuilder sb = new StringBuilder();
        sb.append("+----------+----------------------+----------+--------------+--------------------------------+----------------------+\n");
        sb.append("| ID       | Tên                  | Loại     | Thương hiệu  | Mô tả                         | Variants             |\n");
        sb.append("+----------+----------------------+----------+--------------+--------------------------------+----------------------+\n");

        for (FullProductDTO product : products) {
            String productId = String.format("%-8d", product.getProductId());
            String productName = String.format("%-20s", truncate(product.getProductName(), 20));
            String category = String.format("%-8s", truncate(product.getCategory() != null ? product.getCategory().getName() : "Unknown", 8));
            String brand = String.format("%-12s", truncate(product.getBrand() != null ? product.getBrand().getName() : "Unknown", 12));
            String description = String.format("%-30s", truncate(product.getDescription() != null ? product.getDescription() : "Không có mô tả", 30));

            sb.append(String.format("| %s | %s | %s | %s | %s |", productId, productName, category, brand, description));

            if (product.getProductVariants() != null && !product.getProductVariants().isEmpty()) {
                sb.append(" Variants: [\n");
                for (ProductVariantsDTO variant : product.getProductVariants()) {
                    Integer quantity = variant.getQuantity();
                    Double price = variant.getPrice();
                    sb.append("  - {Tên: ").append(truncate(variant.getNameVariants(), 20))
                            .append(", Giá: ").append(price != null ? price : "Không có giá")
                            .append(", Số lượng: ").append(quantity != null ? quantity : 0);

                    if (variant.getImages() != null && !variant.getImages().isEmpty()) {
                        sb.append(", Ảnh: [");
                        for (var image : variant.getImages()) {
                            sb.append(image.getImageUrl()).append(", ");
                        }
                        sb.setLength(sb.length() - 2);
                        sb.append("]");
                    }

                    if (variant.getAttributes() != null && !variant.getAttributes().isEmpty()) {
                        sb.append(", Thuộc tính: [");
                        for (AttributeDTO attr : variant.getAttributes()) {
                            sb.append(attr.getName()).append(": ").append(attr.getValue()).append(", ");
                        }
                        sb.setLength(sb.length() - 2);
                        sb.append("]");
                    }
                    sb.append("}\n");
                }
                sb.append("                      ]");
            } else {
                sb.append("                      ");
            }
            sb.append("|\n");
            sb.append("+----------+----------------------+----------+--------------+--------------------------------+----------------------+\n");
        }
        return sb.toString();
    }

    private String truncate(String input, int maxLength) {
        if (input == null) return "";
        return input.length() > maxLength ? input.substring(0, maxLength - 3) + "..." : input;
    }

    private String askGeminiRaw(String prompt) throws Exception {
        try (CloseableHttpClient httpClient = HttpClients.createDefault()) {
            HttpPost httpPost = new HttpPost(apiUrl + "?key=" + apiKey);
            httpPost.setHeader("Content-Type", "application/json");
            // Cập nhật response schema để trả về 4 cấu hình
            String responseSchema = """
                {
                    "type": "object",
                    "properties": {
                        "usagePurpose": { "type": "string" },
                        "budget": { "type": "number" },
                        "builds": {
                            "type": "array",
                            "items": {
                                "type": "object",
                                "properties": {
                                    "buildName": { "type": "string" },
                                    "components": {
                                        "type": "array",
                                        "items": {
                                            "type": "object",
                                            "properties": {
                                                "componentType": { "type": "string" },
                                                "suggestedProduct": {
                                                    "type": "object",
                                                    "properties": {
                                                        "productId": { "type": "number" },
                                                        "productName": { "type": "string" },
                                                        "brand": { "type": "string" },
                                                        "description": { "type": "string" },
                                                        "price": { "type": "number" },
                                                        "quantity": { "type": "number" },
                                                        "imageUrl": { "type": "string" },
                                                        "selectedVariant": {
                                                            "type": "object",
                                                            "properties": {
                                                                "variantId": { "type": "number" },
                                                                "nameVariants": { "type": "string" },
                                                                "price": { "type": "number" },
                                                                "imageUrl": { "type": "string" },
                                                                "attributes": {
                                                                    "type": "array",
                                                                    "items": {
                                                                        "type": "object",
                                                                        "properties": {
                                                                            "name": { "type": "string" },
                                                                            "value": { "type": "string" }
                                                                        }
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    },
                                    "totalCost": { "type": "number" },
                                    "isCompleteBuild": { "type": "boolean" },
                                    "missingComponents": {
                                        "type": "array",
                                        "items": { "type": "string" }
                                    }
                                }
                            }
                        }
                    }
                }
            """;

            String jsonPayload = String.format("""
                {
                    "contents": [
                        {
                            "parts": [
                                {
                                    "text": "%s"
                                }
                            ]
                        }
                    ],
                    "generationConfig": {
                        "response_mime_type": "application/json",
                        "response_schema": %s
                    }
                }
                """, prompt.replace("\"", "\\\""), responseSchema);

            httpPost.setEntity(new StringEntity(jsonPayload, "UTF-8"));

            try (CloseableHttpResponse response = httpClient.execute(httpPost)) {
                if (response.getStatusLine().getStatusCode() != 200) {
                    throw new Exception("API trả về lỗi: " + response.getStatusLine().getReasonPhrase());
                }
                String responseBody = EntityUtils.toString(response.getEntity(), "UTF-8");
                JsonNode jsonNode = objectMapper.readTree(responseBody);

                JsonNode candidates = jsonNode.path("candidates");
                if (candidates.isEmpty()) {
                    throw new Exception("Không nhận được phản hồi từ Gemini API");
                }

                JsonNode content = candidates.get(0).path("content").path("parts").get(0).path("text");
                if (content.isMissingNode()) {
                    throw new Exception("Không tìm thấy dữ liệu JSON trong response");
                }

                return content.asText();
            }
        }
    }

    public String suggestBuildByUsage(String usagePurpose, double budget) throws Exception {
        List<FullProductDTO> allProducts = productService.getAllProductsWithFullDetails();
        if (allProducts.isEmpty()) {
            return "{\"error\": \"Hiện tại không có sản phẩm nào trong shop.\"}";
        }
        String productsString = productsToString(allProducts);
        // Cập nhật prompt để yêu cầu 4 cấu hình
        String prompt = """
            Bạn là một chuyên gia tư vấn máy tính. Dựa trên nhu cầu sử dụng: "%s"
            Và ngân sách: %f VNĐ
            Cùng danh sách sản phẩm có sẵn trong shop:
            %s
            Gợi ý chính xác 4 cấu hình PC hoàn chỉnh (CPU, Mainboard, RAM, SSD/HDD, GPU, PSU, Case) sao cho:
            - Mỗi cấu hình có tên (buildName) như "Cấu hình 1", "Cấu hình 2", "Cấu hình 3", "Cấu hình 4".
            - Tổng chi phí của mỗi cấu hình không vượt quá ngân sách (%f VNĐ).
            - Chọn cụ thể một variant từ mỗi sản phẩm dựa trên giá và thuộc tính tương thích (ví dụ: socket CPU khớp với Mainboard).
            - Đảm bảo đủ linh kiện (CPU, Mainboard, RAM, SSD/HDD, PSU, Case). GPU là tùy chọn.
            - Ưu tiên hiệu năng dựa trên nhu cầu sử dụng (ví dụ: Gaming thì ưu tiên GPU mạnh).
            - Khi chọn variant, nếu variant có danh sách ảnh (Ảnh), hãy chọn ngẫu nhiên một URL ảnh từ danh sách đó để gán vào trường imageUrl trong suggestedProduct và selectedVariant.
            - Nếu variant không có ảnh, sử dụng imageUrl mặc định của sản phẩm.
            Trả về kết quả theo cấu trúc JSON đã được định nghĩa trong response_schema, với "builds" là danh sách 4 cấu hình.
            Nếu không đủ linh kiện để tạo PC hoàn chỉnh trong ngân sách, đặt isCompleteBuild = false và liệt kê các linh kiện thiếu trong missingComponents cho từng cấu hình.
            Chỉ dùng variant có sẵn trong shop.
            """.formatted(usagePurpose, budget, productsString, budget);
        return askGeminiRaw(prompt);
    }
}