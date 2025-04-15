from flask import Flask, request, jsonify, Response
from data import get_response  # Import hàm get_response từ data.py
import google.generativeai as genai
import os
import json
import concurrent.futures
import threading
from dotenv import load_dotenv

# Load biến môi trường từ file .env
load_dotenv()

# Khởi tạo Flask app
app = Flask(__name__)

# Tải tất cả dữ liệu từ thư mục data_json
# Sửa đường dẫn tương đối để đảm bảo tìm được thư mục
DATA_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../AI_BUILD_PC/data_json"))
DATABASE_EXPORT_FILE = "database_export.json"
database_data = {}

try:
    # Ưu tiên tải database_export.json trước
    database_export_path = os.path.join(DATA_DIR, DATABASE_EXPORT_FILE)
    print(f"Đang tìm file tại: {database_export_path}")
    if os.path.exists(database_export_path):
        try:
            with open(database_export_path, 'r', encoding='utf-8') as f:
                database_data = json.load(f)
                table_count = len(database_data.keys())
                product_count = len(database_data.get("Products", []))
                print(f"✅ Đã tải thành công {DATABASE_EXPORT_FILE}")
                print(f"  - Số bảng dữ liệu: {table_count}")
                print(f"  - Số sản phẩm: {product_count}")
                print(f"  - Các bảng: {', '.join(list(database_data.keys())[:5])}...")
        except Exception as e:
            print(f"❌ Lỗi khi tải {DATABASE_EXPORT_FILE}: {str(e)}")
    else:
        print(f"❌ Không tìm thấy file {DATABASE_EXPORT_FILE} trong thư mục {DATA_DIR}")
        # Thử tìm tất cả các file trong thư mục
        if os.path.exists(os.path.dirname(DATA_DIR)):
            print(f"Nội dung thư mục cha {os.path.dirname(DATA_DIR)}:")
            parent_contents = os.listdir(os.path.dirname(DATA_DIR))
            for item in parent_contents:
                print(f"  - {item}")

    # Tiếp tục tải các file JSON khác (nếu cần)
    if os.path.exists(DATA_DIR) and os.path.isdir(DATA_DIR):
        json_files = [f for f in os.listdir(DATA_DIR) if f.endswith('.json') and f != DATABASE_EXPORT_FILE]
        
        if json_files:
            print(f"Đã tìm thấy {len(json_files)} file JSON khác trong thư mục {DATA_DIR}")
            
            for json_file in json_files:
                file_path = os.path.join(DATA_DIR, json_file)
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        file_data = json.load(f)
                        database_data[os.path.splitext(json_file)[0]] = file_data
                        print(f"Đã tải dữ liệu từ {json_file}")
                except Exception as e:
                    print(f"Lỗi khi tải dữ liệu từ {json_file}: {str(e)}")
        else:
            print(f"Không tìm thấy file JSON bổ sung nào trong thư mục {DATA_DIR}")
    else:
        print(f"Thư mục {DATA_DIR} không tồn tại")
except Exception as e:
    print(f"Lỗi khi đọc thư mục {DATA_DIR}: {str(e)}")

# Cấu hình Gemini API
GEMINI_API_KEY = os.getenv("GOOGLE_API_KEY")
gemini_available = False

if GEMINI_API_KEY:
    try:
        genai.configure(api_key=GEMINI_API_KEY)
        
        # Khởi tạo model
        model = genai.GenerativeModel(
            model_name="gemini-1.5-pro-001",
            generation_config={
                "temperature": 0.7,
                "top_p": 0.95,
                "top_k": 64,
                "max_output_tokens": 1024,
            }
        )
        gemini_available = True
        print("Gemini API đã được cấu hình thành công!")
    except Exception as e:
        print(f"Lỗi khi khởi tạo Gemini: {str(e)}")
        gemini_available = False
else:
    print("Không tìm thấy GOOGLE_API_KEY trong .env - Chức năng Gemini sẽ bị vô hiệu hóa")

# Thiết lập executor cho concurrent processing
concurrent_executor = concurrent.futures.ThreadPoolExecutor(max_workers=10)

# Lọc dữ liệu liên quan dựa trên từ khóa
def filter_relevant_data(message, data):
    keywords = message.lower().split()
    
    # Danh sách các từ khóa phổ biến để loại bỏ
    common_words = ["là", "gì", "cho", "tôi", "của", "có", "và", "hay", "được", "không", "gợi", "ý"]
    keywords = [k for k in keywords if k not in common_words and len(k) > 2]
    
    if not keywords:
        # Nếu không có từ khóa hợp lệ, trả về một phần dữ liệu cơ bản
        basic_data = {}
        if "Products" in data:
            basic_data["Products"] = data["Products"][:10]  # Chỉ lấy 10 sản phẩm đầu tiên
        if "Categories" in data:
            basic_data["Categories"] = data["Categories"]
        if "Brands" in data:
            basic_data["Brands"] = data["Brands"]
        return basic_data
    
    relevant_data = {}
    
    # Lọc brands dựa trên từ khóa
    if "Brands" in data:
        relevant_brands = []
        for brand in data["Brands"]:
            brand_name = brand.get("name", "").lower()
            if any(keyword in brand_name for keyword in keywords):
                relevant_brands.append(brand)
        if relevant_brands:
            relevant_data["Brands"] = relevant_brands
    
    # Lọc categories dựa trên từ khóa
    if "Categories" in data:
        relevant_categories = []
        for category in data["Categories"]:
            category_name = category.get("name", "").lower()
            if any(keyword in category_name for keyword in keywords):
                relevant_categories.append(category)
        if relevant_categories:
            relevant_data["Categories"] = relevant_categories
    
    # Lọc Products dựa trên từ khóa
    if "Products" in data:
        relevant_products = []
        for product in data["Products"]:
            product_name = product.get("name", "").lower()
            product_description = product.get("description", "").lower()
            if any(keyword in product_name or keyword in product_description for keyword in keywords):
                relevant_products.append(product)
        
        # Nếu không tìm thấy sản phẩm liên quan trực tiếp, tìm kiếm sản phẩm theo brand hoặc category
        if not relevant_products and ("Brands" in relevant_data or "Categories" in relevant_data):
            brand_ids = [b.get("id") for b in relevant_data.get("Brands", [])]
            category_ids = [c.get("id") for c in relevant_data.get("Categories", [])]
            
            for product in data["Products"]:
                if (brand_ids and product.get("brandId") in brand_ids) or (category_ids and product.get("categoryId") in category_ids):
                    relevant_products.append(product)
        
        # Giới hạn số lượng sản phẩm để tránh quá tải
        relevant_data["Products"] = relevant_products[:20]
    
    # Lọc Product_Variants dựa trên sản phẩm
    if "Product_Variants" in data and "Products" in relevant_data:
        relevant_variants = []
        product_ids = [p.get("id") for p in relevant_data["Products"]]
        
        for variant in data["Product_Variants"]:
            if variant.get("productId") in product_ids:
                relevant_variants.append(variant)
        
        if relevant_variants:
            relevant_data["Product_Variants"] = relevant_variants[:30]  # Giới hạn số lượng biến thể
    
    # Lọc Attributes_Product_Variants để thêm thông tin chi tiết về biến thể
    if "Attributes_Product_Variants" in data and "Product_Variants" in relevant_data:
        variant_ids = [v.get("id") for v in relevant_data["Product_Variants"]]
        relevant_attributes = []
        
        for attr in data["Attributes_Product_Variants"]:
            if attr.get("product_variant_id") in variant_ids:
                relevant_attributes.append(attr)
        
        if relevant_attributes:
            relevant_data["Attributes_Product_Variants"] = relevant_attributes
    
    # Lọc Attributes để hiểu thuộc tính
    if "Attributes" in data and "Attributes_Product_Variants" in relevant_data:
        attr_ids = [a.get("attribute_id") for a in relevant_data.get("Attributes_Product_Variants", [])]
        relevant_attr_info = []
        
        for attr in data["Attributes"]:
            if attr.get("id") in attr_ids:
                relevant_attr_info.append(attr)
        
        if relevant_attr_info:
            relevant_data["Attributes"] = relevant_attr_info
    
    # Nếu không tìm thấy dữ liệu nào liên quan, trả về dữ liệu cơ bản
    if not relevant_data or "Products" not in relevant_data:
        basic_data = {}
        if "Products" in data:
            basic_data["Products"] = data["Products"][:10]
        if "Categories" in data:
            basic_data["Categories"] = data["Categories"]
        if "Brands" in data:
            basic_data["Brands"] = data["Brands"]
        if "Product_Variants" in data:
            # Chọn các biến thể cho 10 sản phẩm đầu tiên
            product_ids = [p.get("id") for p in basic_data["Products"]]
            variants = [v for v in data["Product_Variants"] if v.get("productId") in product_ids]
            basic_data["Product_Variants"] = variants[:20]
        return basic_data
    
    return relevant_data

# Xử lý câu hỏi với Gemini
def process_with_gemini(message):
    if not gemini_available:
        return None
    
    try:
        # Kiểm tra nếu không có dữ liệu sản phẩm, trả về thông báo
        if not database_data or "Products" not in database_data or len(database_data.get("Products", [])) == 0:
            return "Chào bạn! Dường như tôi không thể truy cập được dữ liệu sản phẩm. Vui lòng kiểm tra lại kết nối dữ liệu."
        
        # Lọc dữ liệu liên quan
        product_data = {}
        if database_data:
            product_data = filter_relevant_data(message, database_data)
        
        prompt = f"""
        Bạn là trợ lý ảo của cửa hàng linh kiện máy tính, điện thoại và đồ công nghệ.
        Hãy trả lời câu hỏi sau một cách thân thiện, ngắn gọn và hữu ích.
        Sử dụng tiếng Việt để trả lời.
        
        QUAN TRỌNG: Cửa hàng có nhiều sản phẩm trong dữ liệu. Nếu người dùng hỏi về sản phẩm, KHÔNG BAO GIỜ nói rằng "cửa hàng không có sản phẩm".
        
        Hướng dẫn về dữ liệu:
        - "Products": Thông tin cơ bản về sản phẩm (tên, mô tả, giá gốc, thương hiệu)
        - "Product_Variants": Biến thể của sản phẩm với các thông số kỹ thuật và giá cụ thể
        - "Attributes_Product_Variants": Liên kết giữa thuộc tính và biến thể sản phẩm
        - "Attributes": Các thuộc tính kỹ thuật (RAM, CPU, dung lượng, màu sắc,...)
        
        Khi trả lời về sản phẩm, hãy cung cấp thông tin chi tiết từ Product_Variants nếu có, vì đó là thông tin chính xác về cấu hình và giá bán.
        
        Dưới đây là dữ liệu về sản phẩm của cửa hàng:
        {json.dumps(product_data, ensure_ascii=False) if product_data else "Không có dữ liệu sản phẩm"}
        
        Câu hỏi: {message}
        """
        
        try:
            response = model.generate_content(prompt)
            return response.text
        except Exception as e:
            print(f"Lỗi khi sử dụng Gemini với dữ liệu đầy đủ: {str(e)}")
            
            # Thử lại với ít dữ liệu hơn nếu gặp lỗi
            reduced_data = {}
            if "Products" in product_data:
                reduced_data["Products"] = product_data["Products"][:5]  # Chỉ lấy 5 sản phẩm
            if "Brands" in product_data:
                reduced_data["Brands"] = product_data["Brands"][:3]
            if "Categories" in product_data:
                reduced_data["Categories"] = product_data["Categories"][:3]
            
            reduced_prompt = f"""
            Bạn là trợ lý ảo của cửa hàng linh kiện máy tính, điện thoại và đồ công nghệ.
            Hãy trả lời câu hỏi sau một cách thân thiện, ngắn gọn và hữu ích.
            Sử dụng tiếng Việt để trả lời.
            
            Dưới đây là dữ liệu về sản phẩm của cửa hàng (đã giảm kích thước):
            {json.dumps(reduced_data, ensure_ascii=False) if reduced_data else "Không có dữ liệu sản phẩm"}
            
            Câu hỏi: {message}
            """
            
            try:
                response = model.generate_content(reduced_prompt)
                return response.text
            except Exception as e:
                print(f"Lỗi khi sử dụng Gemini với dữ liệu đã giảm: {str(e)}")
                
                # Thử lại lần cuối không dùng dữ liệu sản phẩm
                final_prompt = f"""
                Bạn là trợ lý ảo của cửa hàng linh kiện máy tính, điện thoại và đồ công nghệ.
                Hãy trả lời câu hỏi sau một cách thân thiện, ngắn gọn và hữu ích.
                Sử dụng tiếng Việt để trả lời.
                
                Câu hỏi: {message}
                """
                
                try:
                    response = model.generate_content(final_prompt)
                    return response.text
                except Exception as e:
                    print(f"Lỗi khi sử dụng Gemini không có dữ liệu: {str(e)}")
                    return None
    except Exception as e:
        print(f"Lỗi khi xử lý với Gemini: {str(e)}")
        return None

@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json()
    if not data or "message" not in data:
        return jsonify({"error": "Thiếu dữ liệu đầu vào"}), 400

    user_message = data["message"]
    
    # Kiểm tra dữ liệu sản phẩm trước khi xử lý
    if not database_data or "Products" not in database_data or len(database_data.get("Products", [])) == 0:
        # Nếu không có dữ liệu sản phẩm, trả về thông báo lỗi
        debug_info = {
            "data_dir_exists": os.path.exists(DATA_DIR) if DATA_DIR else False,
            "data_dir_path": DATA_DIR,
            "database_keys": list(database_data.keys()) if database_data else []
        }
        return jsonify({
            "reply": "Dường như hệ thống chưa tải được dữ liệu sản phẩm. Vui lòng thử lại sau hoặc liên hệ quản trị viên.",
            "source": "system",
            "debug": debug_info
        })
    
    # Xử lý song song cả Gemini và phương thức cũ
    gemini_future = None
    tfidf_future = None
    
    # Chạy cả hai phương thức xử lý trong các luồng riêng biệt
    if gemini_available:
        gemini_future = concurrent_executor.submit(process_with_gemini, user_message)
    
    # Luôn chạy phương thức TFIDF song song
    tfidf_future = concurrent_executor.submit(get_response, user_message)
    
    # Ưu tiên kết quả từ Gemini nếu có
    gemini_response = None
    tfidf_response = None
    
    # Timeout cho các phương thức xử lý (giây)
    timeout = 10
    
    try:
        if gemini_future:
            gemini_response = gemini_future.result(timeout=timeout)
        
        # Ngay cả khi có kết quả từ Gemini, vẫn đợi TFIDF để so sánh
        if tfidf_future:
            tfidf_response = tfidf_future.result(timeout=timeout)
    except concurrent.futures.TimeoutError:
        print("Một hoặc nhiều phương thức xử lý đã hết thời gian chờ")
    except Exception as e:
        print(f"Lỗi khi xử lý song song: {str(e)}")
    
    # Logic lựa chọn kết quả
    if gemini_response:
        return jsonify({"reply": gemini_response, "source": "gemini"})
    elif tfidf_response:
        # Kiểm tra nếu tfidf_response có chứa thông báo "không có sản phẩm" thì thay thế
        if "chưa có sản phẩm" in tfidf_response.lower():
            return jsonify({
                "reply": "Chúng tôi có nhiều sản phẩm về linh kiện máy tính, điện thoại và đồ công nghệ. Bạn có thể cho biết bạn đang tìm loại sản phẩm nào không?",
                "source": "fallback"
            })
        return jsonify({"reply": tfidf_response, "source": "tfidf"})
    else:
        return jsonify({
            "reply": "Xin lỗi, tôi đang gặp sự cố kỹ thuật. Vui lòng thử lại sau.",
            "source": "error"
        })

# API endpoint để streaming phản hồi từ Gemini
@app.route("/chat/stream", methods=["POST"])
def chat_stream():
    if not gemini_available:
        return jsonify({"error": "Gemini API không khả dụng"}), 503
        
    data = request.get_json()
    if not data or "message" not in data:
        return jsonify({"error": "Thiếu dữ liệu đầu vào"}), 400

    user_message = data["message"]
    
    def generate():
        # Lọc dữ liệu liên quan
        product_data = {}
        if database_data:
            product_data = filter_relevant_data(user_message, database_data)
        
        prompt = f"""
        Bạn là trợ lý ảo của cửa hàng linh kiện máy tính, điện thoại và đồ công nghệ.
        Hãy trả lời câu hỏi sau một cách thân thiện, ngắn gọn và hữu ích.
        Sử dụng tiếng Việt để trả lời.
        
        QUAN TRỌNG: Cửa hàng có nhiều sản phẩm trong dữ liệu. Nếu người dùng hỏi về sản phẩm, KHÔNG BAO GIỜ nói rằng "cửa hàng không có sản phẩm".
        
        Hướng dẫn về dữ liệu:
        - "Products": Thông tin cơ bản về sản phẩm (tên, mô tả, giá gốc, thương hiệu)
        - "Product_Variants": Biến thể của sản phẩm với các thông số kỹ thuật và giá cụ thể
        - "Attributes_Product_Variants": Liên kết giữa thuộc tính và biến thể sản phẩm
        - "Attributes": Các thuộc tính kỹ thuật (RAM, CPU, dung lượng, màu sắc,...)
        
        Khi trả lời về sản phẩm, hãy cung cấp thông tin chi tiết từ Product_Variants nếu có, vì đó là thông tin chính xác về cấu hình và giá bán.
        
        Dưới đây là dữ liệu về sản phẩm của cửa hàng:
        {json.dumps(product_data, ensure_ascii=False) if product_data else "Không có dữ liệu sản phẩm"}
        
        Câu hỏi: {user_message}
        """
        
        try:
            response = model.generate_content(prompt, stream=True)
            
            for chunk in response:
                if chunk.text:
                    yield f"data: {json.dumps({'chunk': chunk.text})}\n\n"
            
            yield f"data: {json.dumps({'done': True})}\n\n"
        except Exception as e:
            # Thử lại với ít dữ liệu hơn nếu gặp lỗi
            try:
                print(f"Lỗi khi streaming với dữ liệu đầy đủ: {str(e)}")
                
                reduced_data = {}
                if "Products" in product_data:
                    reduced_data["Products"] = product_data["Products"][:5]
                if "Brands" in product_data:
                    reduced_data["Brands"] = product_data["Brands"][:3]
                if "Categories" in product_data:
                    reduced_data["Categories"] = product_data["Categories"][:3]
                
                reduced_prompt = f"""
                Bạn là trợ lý ảo của cửa hàng linh kiện máy tính, điện thoại và đồ công nghệ.
                Hãy trả lời câu hỏi sau một cách thân thiện, ngắn gọn và hữu ích.
                Sử dụng tiếng Việt để trả lời.
                
                Dưới đây là dữ liệu về sản phẩm của cửa hàng (đã giảm kích thước):
                {json.dumps(reduced_data, ensure_ascii=False) if reduced_data else "Không có dữ liệu sản phẩm"}
                
                Câu hỏi: {user_message}
                """
                
                response = model.generate_content(reduced_prompt, stream=True)
                
                for chunk in response:
                    if chunk.text:
                        yield f"data: {json.dumps({'chunk': chunk.text})}\n\n"
                
                yield f"data: {json.dumps({'done': True})}\n\n"
            except Exception as e:
                # Thử lại lần cuối không dùng dữ liệu sản phẩm
                try:
                    print(f"Lỗi khi streaming với dữ liệu đã giảm: {str(e)}")
                    
                    final_prompt = f"""
                    Bạn là trợ lý ảo của cửa hàng linh kiện máy tính, điện thoại và đồ công nghệ.
                    Hãy trả lời câu hỏi sau một cách thân thiện, ngắn gọn và hữu ích.
                    Sử dụng tiếng Việt để trả lời.
                    
                    Câu hỏi: {user_message}
                    """
                    
                    response = model.generate_content(final_prompt, stream=True)
                    
                    for chunk in response:
                        if chunk.text:
                            yield f"data: {json.dumps({'chunk': chunk.text})}\n\n"
                    
                    yield f"data: {json.dumps({'done': True})}\n\n"
                except Exception as e:
                    print(f"Lỗi khi streaming không có dữ liệu: {str(e)}")
                    yield f"data: {json.dumps({'error': str(e)})}\n\n"
    
    return Response(generate(), mimetype='text/event-stream')

if __name__ == "__main__":
    print("=== KHỞI ĐỘNG CHATBOT ===")
    print(f"Gemini API: {'Khả dụng' if gemini_available else 'Không khả dụng'}")
    
    if database_data:
        print(f"Dữ liệu sản phẩm: Đã tải")
        product_count = len(database_data.get("Products", []))
        brand_count = len(database_data.get("Brands", []))
        category_count = len(database_data.get("Categories", []))
        print(f"  - Sản phẩm: {product_count}")
        print(f"  - Thương hiệu: {brand_count}")
        print(f"  - Danh mục: {category_count}")
    else:
        print(f"Dữ liệu sản phẩm: Không có")
    
    app.run(debug=True, port=5000)
