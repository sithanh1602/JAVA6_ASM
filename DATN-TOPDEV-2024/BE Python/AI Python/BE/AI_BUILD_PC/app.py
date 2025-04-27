from flask import Blueprint, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import os
import json
import random
import re
from datetime import datetime

build_PC= Blueprint("build_PC",__name__)
# Enable CORS for all routes
CORS(build_PC)

# Configure Gemini API key - hardcoded for development, use environment variable in production
API_KEY = os.getenv("GEMINI_API_KEY", "AIzaSyDhAbhPJg47Q4bwkU3NcbNuoQLwKdN7YvY")
genai.configure(api_key=API_KEY)

# Initialize Gemini model
model = genai.GenerativeModel("gemini-2.5-pro-exp-03-25")


def analyze_compatibility(selected_component, current_build, metadata=None, available_products=None):
    """
    Phân tích tính tương thích và chỉ gợi ý sản phẩm từ danh sách có trong modal.
    """
    # Extract target category
    target_category = metadata.get('targetCategory', {}) if metadata else {}
    category_name = target_category.get('name', selected_component.get('categoryName', 'component'))

    # Kiểm tra nếu không có sản phẩm nào
    if not available_products or len(available_products) == 0:
        return {"recommendations": [], "error": "Không có sản phẩm nào để gợi ý"}

    # Build current config description
    chosen = [f"{c.get('categoryName', 'Unknown')}: {c.get('nameVariants', 'Unknown')}" 
              for c in current_build.values() if isinstance(c, dict)]
    config_desc = "\n".join(chosen) if chosen else "Chưa có linh kiện nào được chọn"
    
    # Tạo danh sách sản phẩm để sử dụng trong prompt
    product_list = []
    for i, p in enumerate(available_products):
        name = p.get('nameVariants', 'Unknown Product')
        price = p.get('discountPrice') if p.get('discountPrice') and p.get('discountPrice') > 0 else p.get('price', 0)
        product_list.append(f"{i+1}. {name} - {price:,} VND")
    
    # Giới hạn danh sách để tránh vượt quá context length
    max_products = min(15, len(product_list))
    product_names_str = "\n".join(product_list[:max_products])
    
    prompt = f"""
    Bạn là chuyên gia về phần cứng máy tính. Dựa trên cấu hình PC hiện tại:
    {config_desc}
    
    Tôi cần gợi ý những {category_name} phù hợp nhất từ danh sách sản phẩm có sẵn sau:
    {product_names_str}
    
    Chọn CHÍNH XÁC 3 sản phẩm từ danh sách trên mà bạn cho là phù hợp nhất với cấu hình hiện tại.
    
    Chỉ trả về số thứ tự của sản phẩm (bắt đầu từ 1), cách nhau bằng dấu phẩy.
    Ví dụ: "2,5,7" nếu sản phẩm thứ 2, 5, và 7 là phù hợp nhất.
    
    Chỉ trả về các số, không cần giải thích.
    """
    
    # Gọi model Gemini để lấy chỉ số sản phẩm được gợi ý
    try:
        response = model.generate_content(prompt)
        text = response.text.strip()
        
        # Phân tích kết quả để lấy chỉ số sản phẩm
        indices = re.findall(r'\d+', text)
        
        # Chuyển đổi thành chỉ số 0-based và đảm bảo hợp lệ
        valid_indices = []
        for idx in indices:
            try:
                i = int(idx) - 1  # Chuyển 1-based sang 0-based
                if 0 <= i < len(available_products):
                    valid_indices.append(i)
            except ValueError:
                continue
        
        # Giới hạn số lượng gợi ý là 3
        valid_indices = valid_indices[:3]
        
        # Nếu không có chỉ số hợp lệ, chọn ngẫu nhiên
        if not valid_indices and available_products:
            count = min(3, len(available_products))
            valid_indices = random.sample(range(len(available_products)), count)
        
        # Chuyển đổi các sản phẩm được chọn thành định dạng đầu ra
        recommendations = []
        for i in valid_indices:
            product = available_products[i]
            recommendations.append({
                "nameVariants": product.get("nameVariants", "Unknown Product"),
                "price": product.get("discountPrice") if product.get("discountPrice") and product.get("discountPrice") > 0 else product.get("price", 0),
                "imageUrl": product.get("image", "")
            })
        
        return {"recommendations": recommendations}
        
    except Exception as e:
        # Fallback: Chọn ngẫu nhiên nếu có lỗi
        count = min(3, len(available_products))
        selected_indices = random.sample(range(len(available_products)), count)
        
        recommendations = []
        for i in selected_indices:
            product = available_products[i]
            recommendations.append({
                "nameVariants": product.get("nameVariants", "Unknown Product"),
                "price": product.get("discountPrice") if product.get("discountPrice") and product.get("discountPrice") > 0 else product.get("price", 0),
                "imageUrl": product.get("image", "")
            })
        
        return {"recommendations": recommendations}


@build_PC.route('/recommend-components', methods=['POST'])
def recommend_components():
    """API endpoint để nhận gợi ý linh kiện từ AI"""
    try:
        data = request.json
        
        selected_component = data.get('selectedComponent')
        current_build = data.get('currentBuild', {})
        metadata = data.get('metadata', {})
        available_products = data.get('availableProducts', [])
        
        if not selected_component:
            return jsonify({'error': 'Missing selected component', 'status': 'error'}), 400

        # Phân tích và lấy gợi ý chỉ từ sản phẩm có trong modal
        result = analyze_compatibility(selected_component, current_build, metadata, available_products)
        recommendations = result.get('recommendations', [])
        
        return jsonify({ 
            'status': 'success', 
            'recommendations': recommendations 
        })
    except Exception as e:
        return jsonify({ 'error': str(e), 'status': 'error' }), 500


@build_PC.route('/api/recommend-components', methods=['POST'])
def api_recommend_components():
    """API route to match the frontend's expected endpoint"""
    return recommend_components()


@build_PC.route('/health', methods=['GET'])
def health_check():
    """Endpoint kiểm tra trạng thái hoạt động của API"""
    return jsonify({'status': 'online', 'message': 'Service running'})


# if __name__ == '__main__':
#     app.run(debug=True, host='0.0.0.0', port=5002)