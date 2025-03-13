import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import { Button } from "@nextui-org/react";
import { FaEdit } from "react-icons/fa";
import ProductVariantService from "../../../../services/ProductVariantService";

const ProductVariantsTable = ({ productId, onEditVariant }) => {
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVariants = async () => {
      try {
        const response = await ProductVariantService.getProductVariantsByProductId(productId);
        const processedVariants = response.map(variant => ({
          ...variant,
          displayImageUrl: variant.imageUrl.split(',')[0] // Chỉ lấy URL ảnh đầu tiên
        }));
        setVariants(processedVariants);
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu biến thể:", error);
      } finally {
        setLoading(false);
      }
    };
   
    if (productId) {
      fetchVariants();
    }
  }, [productId]);

  const columns = [
    {
      name: "Tên Biến Thể",
      selector: (row) => row.name || "N/A",
      sortable: true,
      width: "150px",
      wrap: true,
    },
    {
      name: "Giá",
      selector: (row) => row.price.toLocaleString() + " VND",
      sortable: true,
      width: "120px",
    },
    {
      name: "Số Lượng",
      selector: (row) => row.stock,
      sortable: true,
      width: "100px",
    },
    {
      name: "Trạng thái",
      selector: (row) => row.status === "Available" ? "Còn hoạt động" : "Hết hoạt động",
      sortable: true,
      width: "130px",
      wrap: true,
    },
    {
      name: "Ảnh",
      cell: (row) => (
        <img 
          src={row.displayImageUrl} 
          alt="variant" 
          className="w-12 h-12 object-cover rounded-lg"
        />
      ),
      width: "80px",
    },
    {
      name: "Thuộc tính",
      cell: (row) => {
        return row.attributes?.length > 0 ? (
          <div className="flex flex-wrap gap-1 max-w-[200px]">
            {row.attributes.map((attr, index) => (
              <div
                key={index}
                className="px-1.5 py-0.5 text-xs bg-gray-100 rounded"
              >
                <span className="font-medium">{attr.name}:</span> {attr.value}
              </div>
            ))}
          </div>
        ) : "N/A";
      },
      width: "200px",
      wrap: true,
    },
    {
      name: "Thao tác",
      cell: (row) => (
        <Button
          isIconOnly
          color="primary"
          variant="light"
          onClick={() => {
            const processedVariant = {
              idVariants: row.idVariants,
              stock: row.stock,
              price: row.price,
              status: row.status,
              attributes: row.attributes,
              description: row.description || "",
              images: row.imageUrl.split(',').map(url => ({ preview: url }))
            };
            onEditVariant(processedVariant);
          }}
        >
          <FaEdit className="w-4 h-4" />
        </Button>
      ),
      width: "80px",
      center: true,
    },
  ];

  return (
    <div className="w-full">
      <h2 className="text-lg font-semibold mb-4">Danh sách biến thể</h2>
      <DataTable
        columns={columns}
        data={variants}
        progressPending={loading}
        pagination
        paginationPerPage={5}
        paginationRowsPerPageOptions={[5, 10, 15, 20]}
        highlightOnHover
        responsive
        className="overflow-visible"
        fixedHeader
        dense
      />
    </div>
  );
};

export default ProductVariantsTable;