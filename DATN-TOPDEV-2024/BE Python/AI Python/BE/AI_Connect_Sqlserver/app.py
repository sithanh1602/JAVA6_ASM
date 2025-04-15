from flask import Flask, request, jsonify
import pyodbc
import pandas as pd
import google.generativeai as genai
import logging

# Cấu hình logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = Flask(__name__)

# 🔹 Cấu hình Gemini API
genai.configure(api_key="AIzaSyDhAbhPJg47Q4bwkU3NcbNuoQLwKdN7YvY")  # Thay bằng API key của bạn

# 🔹 Kết nối SQL Server
server = "THANHPC09430\\THANHLS"
database = "DATA_JAVA6"
username = "sa"
password = "123"
conn_str = f"DRIVER={{SQL Server}};SERVER={server};DATABASE={database};UID={username};PWD={password}"

# Hàm lấy kết nối SQL
def get_connection():
    try:
        conn = pyodbc.connect(conn_str)
        return conn
    except Exception as e:
        logger.error(f"Lỗi kết nối SQL: {e}")
        return None

# 🔹 Hàm lấy danh sách tên tất cả các biến thể sản phẩm
def get_all_product_variant_names():
    conn = get_connection()
    if not conn:
        return None
    
    try:
        query = """
        SELECT 
            pv.id AS variant_id,
            p.name AS product_name,
            pv.name_variants
        FROM Product_Variants pv
        JOIN Products p ON pv.product_id = p.id
        ORDER BY p.name, pv.name_variants
        """
        
        df = pd.read_sql(query, conn)
        return df
    except Exception as e:
        logger.error(f"Lỗi khi lấy danh sách tên biến thể sản phẩm: {e}")
        return None
    finally:
        conn.close()

# 🔹 Hàm tìm kiếm linh kiện theo nhu cầu
def search_components(search_text):
    conn = get_connection()
    if not conn:
        return None
    
    try:
        # Tìm kiếm theo từ khóa trong tên sản phẩm, mô tả và tên biến thể
        query = """
        SELECT 
            pv.id AS variant_id, 
            p.id AS product_id,
            p.name AS product_name, 
            p.description AS product_description,
            pv.name_variants, 
            pv.description AS variant_description,
            pv.price,
            pv.discount_price,
            pv.discount_percentage,
            pv.quantity,
            pv.status,
            c.name AS category_name,
            b.name AS brand_name
        FROM Product_Variants pv
        JOIN Products p ON pv.product_id = p.id
        LEFT JOIN Categories c ON p.category_id = c.id
        LEFT JOIN Brands b ON p.brands_id = b.brands_id
        WHERE 
            p.name LIKE ? OR
            p.description LIKE ? OR
            pv.name_variants LIKE ? OR
            pv.description LIKE ? OR
            c.name LIKE ? OR
            b.name LIKE ?
        ORDER BY 
            CASE 
                WHEN p.name LIKE ? THEN 1
                WHEN pv.name_variants LIKE ? THEN 2
                ELSE 3
            END,
            pv.price ASC
        """
        
        search_param = f"%{search_text}%"
        params = [search_param] * 8
        
        df = pd.read_sql(query, conn, params=params)
        return df
    except Exception as e:
        logger.error(f"Lỗi tìm kiếm linh kiện: {e}")
        return None
    finally:
        conn.close()

# 🔹 Hàm lấy chi tiết biến thể sản phẩm
def get_product_variants(product_id=None):
    conn = get_connection()
    if not conn:
        return None
    
    try:
        if product_id:
            query = """
            SELECT 
                pv.id AS variant_id, 
                p.id AS product_id,
                p.name AS product_name, 
                p.description AS product_description,
                pv.name_variants, 
                pv.description AS variant_description,
                pv.price,
                pv.discount_price,
                pv.discount_percentage,
                pv.quantity,
                pv.status,
                c.name AS category_name,
                b.name AS brand_name
            FROM Product_Variants pv
            JOIN Products p ON pv.product_id = p.id
            LEFT JOIN Categories c ON p.category_id = c.id
            LEFT JOIN Brands b ON p.brands_id = b.brands_id
            WHERE pv.product_id = ?
            """
            df = pd.read_sql(query, conn, params=[product_id])
        else:
            query = """
            SELECT 
                pv.id AS variant_id, 
                p.id AS product_id,
                p.name AS product_name, 
                p.description AS product_description,
                pv.name_variants, 
                pv.description AS variant_description,
                pv.price,
                pv.discount_price,
                pv.discount_percentage,
                pv.quantity,
                pv.status,
                c.name AS category_name,
                b.name AS brand_name
            FROM Product_Variants pv
            JOIN Products p ON pv.product_id = p.id
            LEFT JOIN Categories c ON p.category_id = c.id
            LEFT JOIN Brands b ON p.brands_id = b.brands_id
            """
            df = pd.read_sql(query, conn)
        
        return df
    except Exception as e:
        logger.error(f"Lỗi lấy thông tin biến thể sản phẩm: {e}")
        return None
    finally:
        conn.close()

# 🔹 Hàm lấy lịch sử đơn hàng của user
def get_order_history(user_id):
    conn = get_connection()
    if not conn:
        return None
    
    try:
        query = """
        SELECT 
            o.id AS order_id, 
            o.order_date, 
            o.total_price, 
            o.status AS order_status, 
            o.payment_status, 
            od.quantity, 
            od.price AS unit_price, 
            p.id AS product_id, 
            p.name AS product_name,
            c.name AS category_name,
            pv.id AS variant_id, 
            pv.name_variants AS variant_name
        FROM Orders o
        JOIN Order_Detail od ON o.id = od.order_id
        JOIN Product_Variants pv ON od.product_variant_id = pv.id
        JOIN Products p ON pv.product_id = p.id
        LEFT JOIN Categories c ON p.category_id = c.id
        WHERE o.user_id = ?
        ORDER BY o.order_date DESC
        """
        
        df = pd.read_sql(query, conn, params=[user_id])
        return df
    except Exception as e:
        logger.error(f"Lỗi lấy lịch sử đơn hàng: {e}")
        return None
    finally:
        conn.close()

# 🔹 Tạo prompt có cấu trúc cho Gemini
def create_component_recommendation_prompt(user_message, components, order_history):
    # Chuẩn bị dữ liệu linh kiện
    if components is not None and not components.empty:
        component_list = []
        for i, comp in components.iterrows():
            price_info = f"{comp['price']:,.0f} VND"
            if comp.get('discount_price') and comp['discount_price'] > 0:
                price_info = f"{comp['discount_price']:,.0f} VND (Giảm {comp['discount_percentage']}%)"
                
            component_info = (
                f"- {comp['product_name']} ({comp['name_variants']})\n"
                f"  + Danh mục: {comp.get('category_name', 'Không xác định')}\n"
                f"  + Hãng: {comp.get('brand_name', 'Không xác định')}\n"
                f"  + Giá: {price_info}\n"
                f"  + Số lượng còn: {comp['quantity']}\n"
                f"  + Mô tả: {comp['variant_description'] if pd.notna(comp['variant_description']) else comp['product_description']}"
            )
            component_list.append(component_info)
        
        components_text = "\n\n".join(component_list[:10])  # Giới hạn 10 kết quả
        if len(component_list) > 10:
            components_text += f"\n\n...và {len(component_list) - 10} linh kiện khác phù hợp"
    else:
        components_text = "Không tìm thấy linh kiện phù hợp."
    
    # Chuẩn bị dữ liệu lịch sử mua hàng
    if order_history is not None and not order_history.empty:
        # Lấy 5 sản phẩm mua gần đây nhất
        recent_orders = order_history.head(5).to_dict(orient="records")
        history_text = "\n".join([
            f"- {item['product_name']} ({item['variant_name']}): {item['unit_price']:,.0f} VND x {item['quantity']}" 
            for item in recent_orders
        ])
    else:
        history_text = "Không có lịch sử mua hàng."
    
    # Tạo prompt
    prompt = f"""
Bạn là trợ lý thông minh chuyên tư vấn linh kiện máy tính. Nhiệm vụ của bạn là phân tích nhu cầu người dùng và gợi ý những linh kiện phù hợp nhất.

YÊU CẦU NGƯỜI DÙNG:
"{user_message}"

LINH KIỆN HIỆN CÓ PHÙ HỢP:
{components_text}

LỊCH SỬ MUA HÀNG GẦN ĐÂY:
{history_text}

Hãy trả lời người dùng một cách chuyên nghiệp với những chỉ dẫn sau:
1. Phân tích yêu cầu của người dùng và giải thích ngắn gọn bạn hiểu nhu cầu của họ như thế nào
2. Gợi ý 3-5 linh kiện phù hợp nhất từ danh sách trên, giải thích lý do tại sao từng linh kiện đó phù hợp
3. Nếu danh sách linh kiện không có sản phẩm nào phù hợp, hãy gợi ý người dùng từ khóa tìm kiếm khác
4. Đề xuất một số tiêu chí kỹ thuật người dùng nên cân nhắc khi lựa chọn linh kiện này
5. Trả lời bằng tiếng Việt, thân thiện và chuyên nghiệp

Trả lời:
"""
    return prompt

# 🔹 API endpoint cho tư vấn linh kiện
@app.route('/recommend-components', methods=['POST'])
def recommend_components():
    try:
        # Lấy dữ liệu từ request
        data = request.get_json()
        user_message = data.get('message', '')
        user_id = data.get('user_id', 1)
        
        if not user_message.strip():
            return jsonify({
                "success": False,
                "response": "Vui lòng nhập yêu cầu về linh kiện bạn cần."
            }), 400
        
        logger.info(f"Nhận yêu cầu tư vấn linh kiện từ user {user_id}: {user_message}")
        
        # Tìm kiếm linh kiện phù hợp
        components = search_components(user_message)
        
        # Lấy lịch sử mua hàng
        order_history = get_order_history(user_id)
        
        # Tạo prompt cho Gemini
        prompt = create_component_recommendation_prompt(user_message, components, order_history)
        
        # Gọi Gemini API
        model = genai.GenerativeModel("gemini-1.5-pro-001")
        response = model.generate_content(prompt)
        
        logger.info(f"Đã tạo phản hồi tư vấn cho user {user_id}")
        
        return jsonify({
            "success": True,
            "response": response.text.strip(),
            "components_count": len(components) if components is not None else 0
        })
    
    except Exception as e:
        logger.error(f"Lỗi xử lý yêu cầu tư vấn: {e}")
        return jsonify({
            "success": False,
            "response": f"Đã xảy ra lỗi khi xử lý yêu cầu. Vui lòng thử lại sau."
        }), 500

# 🔹 API endpoint để lấy tất cả tên biến thể sản phẩm
@app.route('/product-variants', methods=['GET'])
def get_product_variants_list():
    try:
        variants_df = get_all_product_variant_names()
        
        if variants_df is None or variants_df.empty:
            return jsonify({
                "success": False,
                "message": "Không thể lấy danh sách biến thể sản phẩm"
            }), 500
        
        # Chuyển đổi dataframe thành danh sách các dictionary
        variants_list = []
        for _, row in variants_df.iterrows():
            variants_list.append({
                "variant_id": int(row['variant_id']),
                "product_name": row['product_name'],
                "variant_name": row['name_variants'],
                "full_name": f"{row['product_name']} - {row['name_variants']}"
            })
        
        return jsonify({
            "success": True,
            "count": len(variants_list),
            "variants": variants_list
        })
    
    except Exception as e:
        logger.error(f"Lỗi xử lý yêu cầu lấy danh sách biến thể: {e}")
        return jsonify({
            "success": False,
            "message": f"Đã xảy ra lỗi khi xử lý yêu cầu. Vui lòng thử lại sau."
        }), 500

# 🔹 API endpoint cho trang chủ
@app.route('/', methods=['GET'])
def home():
    return jsonify({
        "message": "API tư vấn linh kiện đang hoạt động",
        "endpoints": {
            "/recommend-components": "POST - Nhận tư vấn linh kiện dựa trên yêu cầu",
            "/product-variants": "GET - Lấy danh sách tất cả tên biến thể sản phẩm"
        }
    })

if __name__ == '__main__':
    app.run(debug=True)