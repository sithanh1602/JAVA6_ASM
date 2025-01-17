import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import Handsontable from 'handsontable';
import 'handsontable/dist/handsontable.full.min.css';
import Swal from 'sweetalert2';
import templateNextUI from "../nextUI/templateNextUI";
import TemplateNextUI from "../nextUI/templateNextUI";
import {Input} from "@nextui-org/react";

const TemplateList = () => {
    const [templates, setTemplates] = useState([]);
    const [tableData, setTableData] = useState([]);
    const [hotInstance, setHotInstance] = useState(null);
    const [sheetNames, setSheetNames] = useState([]);
    const [selectedSheet, setSelectedSheet] = useState(null);
    const workbookRef = useRef(null);

    useEffect(() => {
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/templates');
            setTemplates(response.data);
        } catch (error) {
            console.error('Error fetching templates:', error);
        }
    };

    const handleView = async (id) => {
        try {
            const response = await axios.get(`http://localhost:8080/api/templates/${id}`, { responseType: 'blob' });
            const file = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

            const reader = new FileReader();
            reader.onload = (e) => {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, {
                    type: "array",
                    cellStyles: true,
                });

                workbookRef.current = workbook;

                const sheetNames = workbook.SheetNames;
                setSheetNames(sheetNames);
                setSelectedSheet(sheetNames[0]);

                loadSheetData(workbook, sheetNames[0]);
            };

            reader.readAsArrayBuffer(file);
        } catch (error) {
            console.error('Error viewing file:', error);
            Swal.fire('Error', 'Không thể tải mẫu lên để xem.', 'error');
        }
    };

    const loadSheetData = (workbook, sheetName) => {
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        setTableData(jsonData);
        renderTable(jsonData, workbook, worksheet);
    };

    const renderTable = (data, workbook, worksheet) => {
        if (hotInstance) {
            hotInstance.destroy();
        }

        const container = document.getElementById('handsontable');
        const newHot = new Handsontable(container, {
            data: data,
            colHeaders: true,
            rowHeaders: true,
            licenseKey: 'non-commercial-and-evaluation',
            height: 'auto',
            width: '100%',
            stretchH: 'all',
            filters: true,
            dropdownMenu: true,
        });

        // Handle merged cells
        const mergedCells = worksheet['!merges'] || [];
        mergedCells.forEach((merge) => {
            const { s, e } = merge;
            newHot.setCellMeta(s.r, s.c, 'colspan', e.c - s.c + 1);
            newHot.setCellMeta(s.r, s.c, 'rowspan', e.r - s.r + 1);
        });

        setHotInstance(newHot);
    };

    const handleSheetChange = (event) => {
        const sheetName = event.target.value;
        setSelectedSheet(sheetName);
        if (workbookRef.current) {
            loadSheetData(workbookRef.current, sheetName);
        }
    };

    const handleDownload = async (id) => {
        try {
            const response = await axios.get(`http://localhost:8080/api/templates/${id}`, { responseType: 'blob' });
            const file = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const fileURL = window.URL.createObjectURL(file);

            const link = document.createElement('a');
            link.href = fileURL;
            link.setAttribute('download', `template-${id}.xlsx`);
            document.body.appendChild(link);
            link.click();
        } catch (error) {
            console.error('Error downloading file:', error);
            Swal.fire('Error', 'Unable to download the template.', 'error');
        }
    };

    const handleDelete = (id) => {
        Swal.fire({
            title: 'Bạn có chắc muốn xoá?',
            text: 'Sau khi xóa, bạn sẽ không thể khôi phục mẫu này!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Có.Hãy xóa nó đi!',
            cancelButtonText: 'Không.Hãy giữ nó lại!',
        }).then((result) => {
            if (result.isConfirmed) {
                deleteTemplate(id);
            }
        });
    };

    const deleteTemplate = async (id) => {
        try {
            await axios.delete(`http://localhost:8080/api/templates/delete/${id}`);
            setTemplates(templates.filter((template) => template.id !== id));
            Swal.fire('Deleted!', 'Mẫu của bạn đã được xóa.', 'success');
        } catch (error) {
            console.error('Error deleting template:', error);
            Swal.fire('Error', 'Không thể xóa mẫu này.', 'error');
        }
    };


    const handleDownloadUpdated = () => {
        if (!workbookRef.current || !hotInstance) return;

        const updatedData = hotInstance.getData();

        const worksheet = XLSX.utils.aoa_to_sheet(updatedData);

        const originalSheet = workbookRef.current.Sheets[selectedSheet];
        if (originalSheet) {
            Object.keys(originalSheet).forEach(key => {
                if (key[0] === '!') return;


                if (originalSheet[key] && originalSheet[key].s) {
                    worksheet[key] = worksheet[key] || {};
                    worksheet[key].s = originalSheet[key].s;
                }
            });
            if (originalSheet['!merges']) {
                worksheet['!merges'] = originalSheet['!merges'];
            }
        }

        workbookRef.current.Sheets[selectedSheet] = worksheet;

        const workbookOut = XLSX.write(workbookRef.current, {
            bookType: 'xlsx',
            type: 'binary',
        });

        // Convert the binary string to an ArrayBuffer (required for Blob)
        const blob = new Blob([s2ab(workbookOut)], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });

        // Create a temporary download link
        const fileURL = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = fileURL;
        link.setAttribute('download', `template-updated-${selectedSheet}.xlsx`);
        document.body.appendChild(link);
        link.click();
        Swal.fire('success', 'Tải thành công.', 'success');
    };

// Function to convert binary string to ArrayBuffer
    function s2ab(s) {
        const buf = new ArrayBuffer(s.length);
        const view = new Uint8Array(buf);
        for (let i = 0; i < s.length; i++) {
            view[i] = s.charCodeAt(i) & 0xff;
        }
        return buf;
    }

    const sizes = ["sm", "md", "lg"];



    return (
        <div className="container mx-auto px-4 py-6">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Danh Sách Mẫu</h2>
            <table className=" bg-white border border-gray-200 shadow-md rounded-lg">
                <thead>
                <tr className="bg-gray-100">
                    <th className="py-2 px-4 border-b">Tên</th>
                    <th className="py-2 px-4 border-b">Hành Động</th>
                </tr>
                </thead>
                <tbody>
                {templates.map((template) => (
                    <tr key={template.id} className="hover:bg-gray-50">
                        <td className="py-2 px-4 border-b">{template.name}</td>
                        <td className="py-2 p-3 border-b">
                            <button
                                onClick={() => handleDownload(template.id)}
                                className="bg-blue-500 text-white px-3 py-1 rounded-md mr-2 hover:bg-blue-600"
                            >
                                Tải về
                            </button>
                            <button
                                onClick={() => handleView(template.id)}
                                className="bg-green-500 text-white px-3 py-1 rounded-md mr-2 hover:bg-green-600"
                            >
                                Xem
                            </button>
                            <button
                                onClick={() => handleDelete(template.id)}
                                className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600"
                            >
                                Xóa
                            </button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>

            {selectedSheet && (
                <div className="mt-4">
                    <button
                        onClick={handleDownloadUpdated}
                        className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                    >
                        Cập nhật và tải về
                    </button>
                </div>
            )}
            <div id="handsontable" className="mt-6"></div>
            {selectedSheet && (
                <div className="mt-6">
                    <label htmlFor="sheetSelector" className="block text-gray-700 font-medium">
                        Chọn Sheet:
                    </label>
                    <select
                        id="sheetSelector"
                        value={selectedSheet}
                        onChange={handleSheetChange}
                        className="mt-2 p-2 border border-gray-300 rounded-md"
                    >
                        {sheetNames.map((sheetName) => (
                            <option key={sheetName} value={sheetName}>
                                {sheetName}
                            </option>
                        ))}
                    </select>
                </div>
            )}
            <TemplateNextUI></TemplateNextUI>
            <div className="w-full flex flex-col gap-4">
                {sizes.map((size) => (
                    <div key={size} className="flex w-full flex-wrap md:flex-nowrap mb-6 md:mb-0 gap-4">
                        <Input label="Email" size={size} type="email"/>
                        <Input label="Email" placeholder="Enter your email" size={size} type="email"/>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TemplateList;
