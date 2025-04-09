import pandas as pd
import pyodbc
from sqlalchemy import create_engine

# 🔹 Thông tin kết nối SQL Server
server = "THANHPC09430\\THANHLS"  # 🔹 Đổi thành server của bạn
database = "DATA_JAVA6"
username = "sa"
password = "123"  # 🔹 Nhập mật khẩu SQL Server

# 🔹 Kết nối SQL Server bằng SQLAlchemy
DATABASE_URL = f"mssql+pyodbc://{username}:{password}@{server}/{database}?driver=ODBC+Driver+17+for+SQL+Server"
engine = create_engine(DATABASE_URL)

# 🔹 Danh sách các bảng từ SQL Server
tables = [
    "Address", "Attributes", "Attributes_Product_Variants", "Brands", "Build_PC",
    "Build_PC_Images", "Build_PC_Product_Variants", "cart_detail", "Categories",
    "Contact", "Favorites", "images", "Notifications", "order_detail", "Orders",
    "Posts", "Product_Variants", "Products", "Reviews", "Role", "templates",
    "User_Role", "Users", "Vouchers"
]

# 🔹 Xuất tất cả bảng thành file .parquet
for table in tables:
    print(f"Đang xuất bảng: {table}...")
    df = pd.read_sql(f"SELECT * FROM dbo.{table}", engine)
    df.to_parquet(f"{table}.parquet", engine="pyarrow", index=False)
    print(f"Đã lưu {table}.parquet")

print("Xuất tất cả bảng thành công!")
