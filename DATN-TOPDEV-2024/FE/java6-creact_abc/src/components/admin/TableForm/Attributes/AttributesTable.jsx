import React, { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import { getAllAttributes } from "../../../../services/AttributeService";

const AttributesTable = ({ onEditAttribute }) => {
  const [attributes, setAttributes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAttributes();
  }, []);

  const fetchAttributes = async () => {
    setLoading(true);
    const data = await getAllAttributes();
    setAttributes(data);
    setLoading(false);
  };

  const handleEdit = (row) => {
    onEditAttribute(row); // Gửi dữ liệu sang AttributesInput
  };

  const columns = [
    {
      name: "Name",
      selector: (row) => row.name,
      sortable: true,
      wrap: true,
    },
    {
      name: "Value",
      selector: (row) => row.value,
      sortable: true,
      wrap: true,
    },
    {
      name: "Actions",
      cell: (row) => (
        <button
          className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
          onClick={() => handleEdit(row)}
        >
          Edit
        </button>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
    },
  ];

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg mt-6">
      <h2 className="text-xl font-semibold mb-4">Attributes List</h2>
      <DataTable
        columns={columns}
        data={attributes}
        pagination
        paginationPerPage={5}
        paginationRowsPerPageOptions={[5, 10, 15, 20]}
        highlightOnHover
        progressPending={loading}
        responsive
        className="border rounded-lg"
      />
    </div>
  );
};

export default AttributesTable;
