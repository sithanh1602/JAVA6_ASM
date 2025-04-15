import pyodbc
import pandas as pd
import json
import os

# 🔹 Thông tin kết nối SQL Server
server = "THANHPC09430\\THANHLS"  # 🔹 Đổi thành server của bạn
database = "DATA_JAVA6"
username = "sa"
password = "123"  # 🔹 Nhập mật khẩu SQL Server

# Kết nối đến SQL Server
conn = pyodbc.connect(f"DRIVER={{SQL Server}};SERVER={server};DATABASE={database};UID={username};PWD={password}")
cursor = conn.cursor()

# 🔹 Danh sách các bảng từ SQL Server
tables = [
    "Address","Product_Variants","Products", "Attributes", "Attributes_Product_Variants", "Brands", "Build_PC",
    "Build_PC_Images", "Build_PC_Product_Variants", "cart_detail", "Categories",
    "Contact", "Favorites", "images", "Notifications", "order_detail", "Orders",
    "Posts", "Product_Variants", "Products", "Reviews", "Role", "templates",
    "User_Role", "Users", "Vouchers"
]

# Thư mục lưu file JSON
output_dir = "data_json"
os.makedirs(output_dir, exist_ok=True)

# Dictionary lưu tất cả dữ liệu JSON
all_data = {}

# Xuất từng bảng thành JSON
for table in tables:
    try:
        print(f"Đang xuất bảng: {table}...")

        # Đọc dữ liệu từ bảng
        query = f"SELECT * FROM {table}"
        df = pd.read_sql(query, conn)

        # Chuyển đổi kiểu Timestamp thành chuỗi dạng ISO format
        for col in df.select_dtypes(include=["datetime64"]):
            df[col] = df[col].astype(str)

        # Chuyển DataFrame thành danh sách dictionary
        table_data = df.to_dict(orient="records")

        # Thêm dữ liệu vào dictionary tổng
        all_data[table] = table_data

        print(f"Đã xuất xong bảng: {table}")

    except Exception as e:
        print(f"Lỗi khi xuất bảng {table}: {e}")

# Lưu toàn bộ dữ liệu vào một file JSON duy nhất
json_path = os.path.join(output_dir, "database_export.json")
with open(json_path, "w", encoding="utf-8") as json_file:
    json.dump(all_data, json_file, indent=4, ensure_ascii=False)

print(f"Xuất dữ liệu hoàn tất! File JSON lưu tại: {json_path}")

# Đóng kết nối
cursor.close()
conn.close()