import pandas as pd

# Đọc file từ thư mục data_parquet
file_path = "data_parquet/Product_Variants.parquet"

df = pd.read_parquet(file_path, engine="pyarrow")  # Hoặc dùng engine="fastparquet"
print(df)

