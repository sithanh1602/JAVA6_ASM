from flask import Blueprint, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import json
import traceback

# ===================== CẤU HÌNH FLASK =====================
gemini_app = Blueprint("gemini_app", __name__) 
CORS(gemini_app)  # Cho phép CORS để frontend React gọi API

# ===================== CẤU HÌNH GEMINI =====================
try:
    genai.configure(api_key="AIzaSyDhAbhPJg47Q4bwkU3NcbNuoQLwKdN7YvY")  # GẮN KEY Ở ĐÂY
    model = genai.GenerativeModel(model_name="gemini-1.5-pro-001")  # hoặc "gemini-1.5-pro" nếu có quyền
except Exception as e:
    print(f"Lỗi khi cấu hình Gemini AI: {str(e)}")
    model = None

# ===================== ENDPOINT PHÂN TÍCH DOANH THU =====================
@gemini_app.route("/api/analyze-revenue", methods=["POST"])
def analyze_revenue():
    try:
        data = request.json.get("data")
        if not data:
            print("Lỗi: Không có dữ liệu được gửi")
            return jsonify({"error": "No data provided"}), 400

        print(f"Dữ liệu nhận được: {data}")

        prompt = """
        Bạn là một chuyên gia phân tích tài chính. Dựa trên dữ liệu doanh thu theo tháng dưới đây, hãy cung cấp một phân tích chi tiết bao gồm:
        - Xu hướng tổng thể (tăng, giảm, ổn định, tăng mạnh, giảm mạnh).
        - Tháng có doanh thu cao nhất và thấp nhất.
        - Doanh thu trung bình.
        - Độ biến động (thấp, trung bình, cao).
        - Khuyến nghị chiến lược kinh doanh dựa trên xu hướng và dữ liệu.
        - Khuyến nghị chiến lược kinh doanh dựa trên xu hướng và dữ liệu cho website TMĐT bán linh kiện điện tử build PC.
        - Đưa ra khuyến nghị ngắn gọn thôi tầm 1-2 câu cho từng mục.

        Dữ liệu doanh thu (theo tháng):
        {data}

        Trả về kết quả dưới dạng JSON thuần túy, không kèm theo bất kỳ văn bản giải thích nào:
        {{
            "trend": "string",
            "highestMonth": {{"month": "string", "revenue": number}},
            "lowestMonth": {{"month": "string", "revenue": number}},
            "averageRevenue": number,
            "volatility": "string",
            "recommendation": "string"
        }}
        """

        # Format dữ liệu thành chuỗi
        data_str = "\n".join([f"Tháng {item['month']}: {item['revenue']}" for item in data])
        formatted_prompt = prompt.format(data=data_str)

        # Gọi Gemini API
        if model is None:
            print("Lỗi: Model Gemini không được khởi tạo")
            return jsonify({"error": "Gemini model not initialized"}), 500

        print("Gửi yêu cầu đến Gemini...")
        response = model.generate_content(formatted_prompt)
        print(f"Phản hồi từ Gemini: {response.text}")

        # Parse JSON từ phản hồi
        try:
            analysis = response.text.strip("```json\n").strip("\n```")
            analysis_json = json.loads(analysis)
        except json.JSONDecodeError as e:
            print(f"Lỗi parse JSON: {str(e)}")
            print(f"Phản hồi gốc: {response.text}")
            return jsonify({"error": "Invalid JSON response from Gemini"}), 500

        return jsonify(analysis_json), 200

    except Exception as e:
        print(f"Lỗi trong analyze_revenue: {str(e)}")
        print(traceback.format_exc())
        return jsonify({"error": str(e)}), 500

# ===================== KHỞI ĐỘNG SERVER =====================
# if __name__ == "__main__":
#     chatbot_app.run(port=5000, debug=True)
