import React, { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import { getAllAttributes } from "../../../../services/AttributeService";
import { FaEdit } from "react-icons/fa";

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

  // Update the handleEdit function to ensure immediate update
  const handleEdit = (row) => {
    console.log("Editing attribute:", row);
    if (onEditAttribute) {
      onEditAttribute({
        id: row.id,
        name: row.name,
        value: row.value
      });
    }
  };

  // Keep the edit button styling consistent
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
          className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 flex items-center gap-1"
          onClick={() => handleEdit(row)}
        >
          <FaEdit className="w-4 h-4" />
          <span>Sửa</span>
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
