package com.be.service;

import com.be.GeminiClientdto.AttributeDTO;
import com.be.GeminiClientdto.FullProductDTO;
import com.be.GeminiClientdto.ProductVariantsDTO;
import com.be.dto.BuildPCProductVariantDTO;
import com.be.dto.BuildPCResponseDTO;
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
import org.springframework.web.context.annotation.SessionScope;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@SessionScope
public class GeminiService {

    private final String apiKey = "AIzaSyDhAbhPJg47Q4bwkU3NcbNuoQLwKdN7YvY"; // Thay bằng key của bạn
    private final String apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Autowired
    private ProductService productService;

    @Autowired
    private BuildPCService buildPCService;

    private final List<ConversationEntry> conversationHistory = new ArrayList<>();

    // Bộ đệm để lưu trữ các câu hỏi đã xử lý (tối ưu hiệu suất)
    private static final Map<String, String> REQUEST_TYPE_CACHE = new HashMap<>();

    private static class ConversationEntry {
        String question;
        String answer;
        String language;
        String requestType;

        ConversationEntry(String question, String answer, String language, String requestType) {
            this.question = question;
            this.answer = answer;
            this.language = language;
            this.requestType = requestType;
        }
    }

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

    private String buildPCsToString(List<BuildPCResponseDTO> buildPCs) {
        StringBuilder sb = new StringBuilder();
        sb.append("+----------+----------------------+------------+------------------+--------------------------------+----------------------+\n");
        sb.append("| ID       | Tên Build            | Giá        | Mục đích         | Mô tả                          | Sản phẩm             |\n");
        sb.append("+----------+----------------------+------------+------------------+--------------------------------+----------------------+\n");

        for (BuildPCResponseDTO buildPC : buildPCs) {
            String buildId = String.format("%-8d", buildPC.getBuildId());
            String buildName = String.format("%-20s", truncate(buildPC.getBuildName(), 20));
            String totalPrice = String.format("%-10.2f", buildPC.getTotalPrice());
            String usagePurpose = String.format("%-16s", truncate(buildPC.getUsagePurpose(), 16));
            String description = String.format("%-30s", truncate(buildPC.getDescription() != null ? buildPC.getDescription() : "Không có mô tả", 30));

            sb.append(String.format("| %s | %s | %s | %s | %s |", buildId, buildName, totalPrice, usagePurpose, description));

            if (buildPC.getBuildPCProductVariants() != null && !buildPC.getBuildPCProductVariants().isEmpty()) {
                sb.append(" Sản phẩm: [\n");
                for (BuildPCProductVariantDTO variant : buildPC.getBuildPCProductVariants()) {
                    sb.append("  - {Variant ID: ").append(variant.getProductVariantId())
                            .append(", Số lượng: ").append(variant.getVariantQuantity())
                            .append("}\n");
                }
                sb.append("                      ]");
            } else {
                sb.append("                      ");
            }
            sb.append("|\n");
            sb.append("+----------+----------------------+------------+------------------+--------------------------------+----------------------+\n");
        }
        return sb.toString();
    }

    private String truncate(String input, int maxLength) {
        if (input == null) return "";
        return input.length() > maxLength ? input.substring(0, maxLength - 3) + "..." : input;
    }

    private String detectLanguage(String question) throws Exception {
        String prompt = """
                Bạn là một chuyên gia ngôn ngữ học. Dựa trên câu hỏi: "%s",
                hãy xác định ngôn ngữ chính được sử dụng. Trả về mã ngôn ngữ ISO 639-1 (ví dụ: "en" cho tiếng Anh, "vi" cho tiếng Việt).
                Nếu không xác định được, trả về "en" làm mặc định.
                Chỉ trả về mã ngôn ngữ, không thêm gì khác.
                """.formatted(question);
        return askGeminiRaw(prompt).trim().toLowerCase();
    }

    private String determineRequestType(String question) throws Exception {
        // Kiểm tra trong bộ đệm
        String cacheKey = question.toLowerCase();
        if (REQUEST_TYPE_CACHE.containsKey(cacheKey)) {
            return REQUEST_TYPE_CACHE.get(cacheKey);
        }

        // Tạo chuỗi lịch sử hội thoại để cung cấp ngữ cảnh (nếu có)
        StringBuilder history = new StringBuilder();
        if (!conversationHistory.isEmpty()) {
            history.append("Lịch sử hội thoại (câu hỏi trước đó):\n");
            for (ConversationEntry entry : conversationHistory) {
                history.append(String.format("- Khách hàng hỏi: \"%s\", Loại yêu cầu: %s\n",
                        entry.question, entry.requestType));
            }
        }

        // Prompt chi tiết yêu cầu Gemini phân tích và trả về requestType
        String prompt = """
                Bạn là một chuyên gia ngôn ngữ học và tư vấn máy tính, chuyên xử lý ngôn ngữ tự nhiên tiếng Việt. Nhiệm vụ của bạn là phân tích câu hỏi của khách hàng và xác định loại yêu cầu của họ. Khách hàng có thể diễn đạt theo nhiều cách khác nhau, bao gồm sai chính tả, viết tắt, từ đồng nghĩa, tiếng lóng, hoặc cách nói không chuẩn. Bạn cần hiểu ngữ cảnh và ý định của họ.

                Dưới đây là thông tin bổ sung để giúp bạn phân tích:
                %s

                Dựa trên câu hỏi hiện tại của khách hàng: "%s",
                hãy xác định loại yêu cầu của họ. Dưới đây là các loại yêu cầu và ví dụ minh họa:

                - specific_part: nếu họ muốn mua một linh kiện cụ thể
                  + Ví dụ: "Tôi cần mua CPU Intel i5", "Có RAM 16GB không?", "Mainboard nào tốt?", "Mua SSD 1TB", "Có GPU RTX 3060 không?", "Máy tinh cần ổ cứng", "Tui cần mua ổ cứng 1TB"
                - full_build: nếu họ muốn xây dựng cấu hình PC hoàn chỉnh
                  + Ví dụ: "Tôi muốn tự ráp PC giá 20 triệu", "Cấu hình PC chơi game như thế nào?", "Tự lắp PC được không?", "Rápc PC giá rẻ", "Lắp máy chơi game giá rẻ giùm tui", "Tự ráp máy tính giá 15tr", "Tui muốn ráp máy chơi game"
                - pre_built: nếu họ muốn mua một PC lắp sẵn
                  + Ví dụ: "PC lắp sẵn có sẵn trong shop?", "Có PC nào lắp sẵn chơi game không?", "Tôi muốn mua PC lắp sẵn", "PC có sẳn không?", "Chưa lựa PC nào tốt?", "Máy tính có sẵn không?", "Shop có máy nào sẵn để cày game không?", "PC dựng sẵn nào mạnh?", "Có máy nào sẵn không?", "Tui muốn mua máy ráp sẵn"
                - unknown: nếu không thể xác định rõ ràng
                  + Ví dụ: "Bạn có bán máy tính không?", "Shop có gì hay không?", "Máy tính giá bao nhiêu?", "Shop bán gì vậy?"

                Lưu ý:
                - Hiểu và chuẩn hóa các biến thể ngôn ngữ, ví dụ: "có sẳn" → "có sẵn", "rápc" → "tự ráp", "máy tinh" → "máy tính", "chả lười" → "chưa lựa".
                - Phân tích ngữ cảnh dựa trên lịch sử hội thoại (nếu có) để xác định ý định chính xác hơn.
                - Chỉ trả về một trong các giá trị sau (không thêm gì khác):
                  - specific_part
                  - full_build
                  - pre_built
                  - unknown
                """.formatted(history.toString(), question);

        String requestType = askGeminiRaw(prompt).trim().toLowerCase();
        // Lưu vào bộ đệm
        REQUEST_TYPE_CACHE.put(cacheKey, requestType);
        return requestType;
    }

    private String askGeminiRaw(String prompt) throws Exception {
        try (CloseableHttpClient httpClient = HttpClients.createDefault()) {
            HttpPost httpPost = new HttpPost(apiUrl + "?key=" + apiKey);
            httpPost.setHeader("Content-Type", "application/json");

            String jsonPayload = String.format("{\"contents\": [{\"parts\": [{\"text\": \"%s\"}]}]}",
                    prompt.replace("\"", "\\\""));
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
                return candidates.get(0).path("content").path("parts").get(0).path("text").asText();
            }
        }
    }

    private String inferRequestTypeFromHistory(String currentQuestion) throws Exception {
        if (conversationHistory.isEmpty()) {
            return determineRequestType(currentQuestion);
        }

        String newRequestType = determineRequestType(currentQuestion);
        if ("unknown".equals(newRequestType)) {
            for (int i = conversationHistory.size() - 1; i >= 0; i--) {
                String previousRequestType = conversationHistory.get(i).requestType;
                if (!"unknown".equals(previousRequestType)) {
                    return previousRequestType;
                }
            }
        }

        return newRequestType;
    }

    public String processUserQuery(String question) throws Exception {
        String language = detectLanguage(question);
        List<FullProductDTO> products = productService.getAllProductsWithFullDetails();
        List<BuildPCResponseDTO> buildPCs = buildPCService.getAllBuildPC();

        if (products.isEmpty() && buildPCs.isEmpty()) {
            String response = language.equals("vi")
                    ? "Hiện tại không có sản phẩm hoặc PC lắp sẵn nào trong shop để tư vấn."
                    : "There are currently no products or pre-built PCs in the shop to advise.";
            conversationHistory.add(new ConversationEntry(question, response, language, "unknown"));
            return response;
        }

        String productsString = productsToString(products);
        String buildPCsString = buildPCsToString(buildPCs);
        String requestType = inferRequestTypeFromHistory(question);

        String prompt;
        if ("specific_part".equals(requestType)) {
            prompt = """
                    Bạn là một chuyên gia tư vấn máy tính và người bán hàng. Khách hàng hỏi: "%s"
                    Dựa trên danh sách sản phẩm có sẵn trong shop:
                    %s
                    Đề xuất 4-5 variant linh kiện phù hợp nhất từ shop, ưu tiên dựa trên giá và thuộc tính (ví dụ: socket, dung lượng).
                    Trả lời ngắn gọn dưới dạng bảng ASCII:
                    +----------------------------+------------+------------------------------+
                    | Sản phẩm                   | Giá tiền   | Lý do đề xuất                | ở đây bạn có thể thay đổi kích thước cho thẩm mỹ và tăng giảm theo câu trả lời
                    +----------------------------+------------+------------------------------+
                    Nếu không tìm thấy variant phù hợp, trả về thông báo: "Hiện tại không có linh kiện phù hợp trong shop."
                    Chỉ dùng variant có sẵn trong shop. 
                    Trả lời bằng ngôn ngữ "%s".
                    """.formatted(question, productsString, language);
        } else if ("full_build".equals(requestType)) {
            prompt = """
                    Bạn là một chuyên gia tư vấn máy tính và người bán hàng. Khách hàng hỏi: "%s"
                    Dựa trên danh sách sản phẩm có sẵn trong shop:
                    %s
                    Đề xuất cấu hình PC hoàn chỉnh (CPU, Mainboard, RAM, SSD/HDD, GPU, PSU, Case) từ các variant trong shop, sao cho:
                    - Tổng chi phí không vượt quá ngân sách (nếu khách hàng đề cập, ví dụ: 20 triệu, nếu không thì tối ưu giá rẻ).
                    - Chọn cụ thể một variant từ mỗi sản phẩm dựa trên giá và thuộc tính tương thích (ví dụ: socket CPU khớp với Mainboard).
                    - Ưu tiên hiệu năng dựa trên nhu cầu (nếu có, ví dụ: Gaming thì ưu tiên GPU mạnh).
                    Trả lời ngắn gọn dưới dạng bảng ASCII:
                    +------------+----------------------------+------------+------------------------------+
                    | Linh kiện  | Sản phẩm                   | Giá tiền   | Lý do đề xuất                |ở đây bạn có thể thay đổi kích thước cho thẩm mỹ và tăng giảm theo câu trả lời
                    +------------+----------------------------+------------+------------------------------+
                    Thêm tổng chi phí. Nếu thiếu linh kiện, ghi chú: "Thiếu linh kiện trong shop."
                    Chỉ dùng variant có sẵn trong shop.
                    Trả lời bằng ngôn ngữ "%s".
                    Nếu hiểu sai ý khách hàng, hãy thêm dòng: "Nếu bạn muốn thay đổi ý định (ví dụ: mua PC lắp sẵn), hãy cho tôi biết nhé!"
                    """.formatted(question, productsString, language);
        } else if ("pre_built".equals(requestType)) {
            prompt = """
                    Bạn là một chuyên gia tư vấn máy tính và người bán hàng. Khách hàng hỏi: "%s"
                    Dựa trên danh sách PC lắp sẵn có sẵn trong shop:
                    %s
                    Đề xuất 3-5 PC lắp sẵn phù hợp nhất từ shop, ưu tiên dựa trên giá và mục đích sử dụng (ví dụ: Gaming, Office).
                    Trả lời ngắn gọn dưới dạng bảng ASCII:
                    +----------------------------+------------+------------------------------+
                    | PC lắp sẵn                 | Giá tiền   | Lý do đề xuất                |ở đây bạn có thể thay đổi kích thước cho thẩm mỹ và tăng giảm theo câu trả lời
                    +----------------------------+------------+------------------------------+
                    Nếu không tìm thấy PC lắp sẵn phù hợp, trả về thông báo: "Hiện tại không có PC lắp sẵn phù hợp trong shop."
                    Chỉ dùng PC lắp sẵn có sẵn trong shop.
                    Trả lời bằng ngôn ngữ "%s".
                    Nếu hiểu sai ý khách hàng, hãy thêm dòng: "Nếu bạn muốn thay đổi ý định (ví dụ: tự ráp PC), hãy cho tôi biết nhé!"
                    """.formatted(question, buildPCsString, language);
        } else {
            prompt = """
                    Bạn là một chuyên gia tư vấn máy tính và người bán hàng. Khách hàng hỏi: "%s"
                    Dựa trên danh sách sản phẩm có sẵn trong shop:
                    %s
                    Và danh sách PC lắp sẵn có sẵn trong shop:
                    %s
                    Hỏi khách hàng xem họ muốn tự ráp PC từ linh kiện riêng lẻ hay chọn một PC lắp sẵn.
                    Trả lời ngắn gọn, ví dụ: "Bạn muốn tự ráp PC từ linh kiện riêng lẻ hay chọn một PC lắp sẵn có sẵn trong shop?"
                    Trả lời bằng ngôn ngữ "%s".
                    """.formatted(question, productsString, buildPCsString, language);
        }

        String response = askGeminiRaw(prompt);
        conversationHistory.add(new ConversationEntry(question, response, language, requestType));
        return response;
    }
}