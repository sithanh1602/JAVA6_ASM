from flask import Blueprint, request, jsonify
from flask_cors import CORS
import pandas as pd
import requests
import google.generativeai as genai
import os

chatbot_app = Blueprint("chatbot_app",__name__)
CORS(chatbot_app, resources={r"/api/*": {"origins": "*"}})  # Cho phép CORS cho tất cả domain

# Cấu hình API key cho Gemini (thay bằng key thật khi deploy)
genai.configure(api_key="AIzaSyDhAbhPJg47Q4bwkU3NcbNuoQLwKdN7YvY")

# Khởi tạo mô hình Gemini
model = genai.GenerativeModel("gemini-2.5-pro-exp-03-25")

# Đường dẫn đến thư mục chứa các file prompt
PROMPT_DIR = os.path.join(os.path.dirname(__file__), "prompts")

def load_prompt(file_name, user_question, additional_data=""):
    """Hàm đọc nội dung prompt từ file và thay thế placeholder"""
    try:
        with open(os.path.join(PROMPT_DIR, file_name), "r", encoding="utf-8") as f:
            prompt = f.read()
        prompt = prompt.replace("{user_question}", user_question)
        if additional_data:
            prompt = prompt.replace("{additional_data}", additional_data)
        return prompt
    except FileNotFoundError:
        raise Exception(f"Không tìm thấy file prompt: {file_name}")

@chatbot_app.route("/api/chat", methods=["POST"])
def chat_with_gemini():
    try:
        user_question = request.json.get("question", "").lower()
        if not user_question:
            return jsonify({"error": "Câu hỏi không được để trống."}), 400

        # Xử lý câu hỏi liên quan đến build PC
        if any(keyword in user_question for keyword in ["pc build", "xây dựng pc", "build pc", "máy tính", "cấu hình", "đề xuất pc", "gợi ý pc", "nhu cầu"]):
            try:
                # Lấy dữ liệu các PC build sẵn
                pc_builds_response = requests.get("http://localhost:8080/api/buildPC/all")
                pc_builds_response.raise_for_status()
                pc_builds = pc_builds_response.json()
                
                # Chuyển đổi dữ liệu để dễ đọc hơn
                pc_data = []
                
                # Kiểm tra xem dữ liệu là list hay dict
                if isinstance(pc_builds, dict):
                    pc_builds = [pc_builds]  # Chuyển dict thành list chứa 1 item
                    
                for build in pc_builds:  
                    components = []
                    for component in build.get("buildPCProductVariants", []):
                        components.append({
                            "name": component.get("nameVariants", "Không có tên"),
                            "category": component.get("categoryName", "Không xác định"),
                            "price": component.get("price", 0),
                            "quantity": component.get("variantQuantity", 1),
                            "image": component.get("image", "Không có ảnh")  # Thêm trường image cho linh kiện
                        })
                    
                    pc_info = {
                        "name": build.get("buildName", "Không có tên"),
                        "purpose": build.get("usagePurpose", "Đa dụng"),
                        "price": build.get("totalPrice", 0),
                        "description": build.get("description", ""),
                        "image": build.get("image", ""),  # Ảnh chính của PC
                        "imageUrls": build.get("imageUrls", []),  # Danh sách ảnh bổ sung của PC
                        "components": components
                    }
                    
                    pc_data.append(pc_info)
                
                # Thêm thông tin chi tiết từng build
                pc_details = "\n## Chi tiết các build PC:\n\n"
                for i, pc in enumerate(pc_data, 1):
                    pc_details += f"- {i}. {pc['name']} ({pc['purpose']})\n"
                    pc_details += f"- Giá: {int(pc['price']):,} VNĐ\n"
                    pc_details += f"- Mô tả: {pc['description']}\n"
                    pc_details += "- Cấu hình:\n"
                    
                    for component in pc["components"]:
                        quantity = f" x{component['quantity']}" if component["quantity"] > 1 else ""
                        pc_details += f"- {component['category']}: {component['name']}{quantity} (Hình ảnh: {component['image']})\n"
                    
                    if pc['image']:
                        pc_details += f"\n**Hình ảnh chính của PC:** {pc['image']}\n"
                    
                    if pc['imageUrls']:
                        pc_details += f"**Hình ảnh bổ sung của PC:**\n"
                        for img_url in pc['imageUrls']:
                            pc_details += f"- {img_url}\n"
                    
                    pc_details += "\n"

                # Tạo prompt và gửi tới Gemini
                prompt = load_prompt("buildpc_prompt.txt", user_question, pc_details)
                gemini_response = model.generate_content(prompt)
                answer = gemini_response.text.strip()

                return jsonify({"answer": answer})
            except requests.exceptions.RequestException as e:
                return jsonify({"error": f"Lỗi khi lấy dữ liệu build PC: {str(e)}"}), 500

        # Xử lý câu hỏi liên quan đến danh mục sản phẩm
        elif any(keyword in user_question for keyword in ["danh mục", "loại sản phẩm", "loại mặt hàng", "category", "các loại"]):
            cat_res = requests.get("http://localhost:8080/api/admin/categories")
            cat_res.raise_for_status()
            categories = cat_res.json()

            df_cat = pd.DataFrame(categories)
            if df_cat.empty or "name" not in df_cat.columns:
                return jsonify({"error": "Không có dữ liệu danh mục sản phẩm."}), 400

            df_cat["output"] = df_cat.apply(lambda row: f"- **{row['name']}**: {row['description']}", axis=1)
            category_list = "\n".join(df_cat["output"].tolist())

            prompt = load_prompt("category_prompt.txt", user_question, category_list)
            gemini_response = model.generate_content(prompt)
            answer = gemini_response.text.strip()

            return jsonify({"answer": answer})

        # Xử lý câu hỏi về sản phẩm bán chạy
        elif any(keyword in user_question for keyword in ["bán chạy", "best seller", "phổ biến", "mua nhiều", "top sản phẩm"]):
            response = requests.get("http://localhost:8080/api/orders/all/ordersDetails")
            response.raise_for_status()
            order_details = response.json()

            order_items = []
            for item in order_details:
                if isinstance(item, dict) and "product_variant_id" in item and "quantity" in item:
                    product_variant = item["product_variant_id"]
                    if isinstance(product_variant, dict) and "nameVariants" in product_variant and "product" in product_variant:
                        order_items.append({
                            "nameVariants": product_variant["nameVariants"],
                            "quantity": item["quantity"],
                            "imageUrl": product_variant.get("product", {}).get("imageUrl", "Không có ảnh")
                        })

            df_orders = pd.DataFrame(order_items)
            if df_orders.empty or "nameVariants" not in df_orders.columns or "quantity" not in df_orders.columns:
                return jsonify({"error": "Dữ liệu đơn hàng không chứa thông tin sản phẩm hoặc số lượng."}), 400

            product_sales = df_orders.groupby(["nameVariants", "imageUrl"])["quantity"].sum().reset_index()
            top_products = product_sales.sort_values(by="quantity", ascending=False).head(3)

            product_response = requests.get("http://localhost:8080/api/product-variants")
            product_response.raise_for_status()
            df_products = pd.DataFrame(product_response.json())

            if df_products.empty or "nameVariants" not in df_products.columns:
                return jsonify({"error": "Dữ liệu sản phẩm không hợp lệ."}), 400

            top_products["price"] = top_products["nameVariants"].map(
                lambda x: df_products[df_products["nameVariants"] == x]["price"].iloc[0] if x in df_products["nameVariants"].values else "N/A"
            )
            top_products["link"] = top_products["nameVariants"].map(
                lambda x: df_products[df_products["nameVariants"] == x].get("link", pd.Series(["Không có đường dẫn"])).iloc[0] if x in df_products["nameVariants"].values else "Không có đường dẫn"
            )
            top_products["price"] = top_products["price"].apply(lambda x: f"{x:,.0f} VNĐ" if isinstance(x, (int, float)) else x)

            # Tạo bảng markdown với thêm cột ảnh
            top_products_output = "| Tên sản phẩm | Số lượng bán | Giá | Đường dẫn | Hình ảnh |\n"
            top_products_output += "|--------------|--------------|-----|-----------|----------|\n"
            for _, row in top_products.iterrows():
                top_products_output += f"| {row['nameVariants']} | {row['quantity']} | {row['price']} | {row['link']} | {row['imageUrl']} |\n"

            prompt = load_prompt("bestsellers_prompt.txt", user_question, top_products_output)
            gemini_response = model.generate_content(prompt)
            answer = gemini_response.text.strip()

            return jsonify({"answer": answer})

        # Xử lý các câu hỏi về tìm kiếm hoặc đề xuất sản phẩm
        elif any(keyword in user_question for keyword in ["sản phẩm", "giá", "mua", "bao nhiêu", "product", "recommend", "gợi ý"]):
            response = requests.get("http://localhost:8080/api/product-variants")
            response.raise_for_status()
            data = response.json()
            print(f"Dữ liệu sản phẩm: {data}")

            df = pd.DataFrame(data)
            if df.empty or "nameVariants" not in df.columns or "price" not in df.columns  or "productId" not in df.columns:
                return jsonify({"error": "Dữ liệu sản phẩm không hợp lệ."}), 400

            website_domain = "http://localhost:3000"  # Thay bằng tên miền thật
            df["link"] = df.apply(
                lambda row: f"{website_domain}/products/{row['productId']}/productdetail" if pd.notna(row['productId']) else "Không có đường dẫn",
                axis=1
            )
            df["image"] = df.get("image", pd.Series(["Không có ảnh"] * len(df)))  # Thêm cột image, mặc định là "Không có ảnh" nếu thiếu

            df = df[["nameVariants", "price", "link", "image"]]
            df["price"] = df["price"].apply(lambda x: f"{x:,.0f} VNĐ")
            product_table = "| Tên sản phẩm | Giá | Đường dẫn | Hình ảnh |\n"
            product_table += "|--------------|-----|-----------|----------|\n"
            for _, row in df.iterrows():
                product_table += f"| {row['nameVariants']} | {row['price']} | {row['link']} | {row['image']} |\n"

            prompt = load_prompt("product_prompt.txt", user_question, product_table)
            gemini_response = model.generate_content(prompt)
            answer = gemini_response.text.strip()

            return jsonify({"answer": answer})

        # Xử lý các câu hỏi chung về cửa hàng
        else:
            prompt = load_prompt("general_prompt.txt", user_question)
            gemini_response = model.generate_content(prompt)
            answer = gemini_response.text.strip()

            return jsonify({"answer": answer})

    except requests.exceptions.RequestException as e:
        return jsonify({"error": f"Lỗi khi gọi API: {str(e)}"}), 500
    except Exception as e:
        return jsonify({"error": f"Lỗi hệ thống: {str(e)}"}), 500

# # Khởi chạy server Flask
# if __name__ == "__main__":
#     gemini_app.run(debug=True, port=5001)