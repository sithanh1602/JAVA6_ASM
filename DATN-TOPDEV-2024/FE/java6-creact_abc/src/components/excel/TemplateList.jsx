import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import Handsontable from 'handsontable';
import 'handsontable/dist/handsontable.full.min.css';
import Swal from 'sweetalert2';
import UploadTemplate from "./UploadTemplate";

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
                    cellStyles: true, // Ensure styles are read
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
            Swal.fire('Error', 'Unable to load the template for viewing.', 'error');
        }
    };

    const loadSheetData = (workbook, sheetName) => {
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        // Get color and style data (e.g., background, font)
        const styleData = jsonData.map((row, rowIndex) =>
            row.map((_, colIndex) => {
                const cellAddress = XLSX.utils.encode_cell({ r: rowIndex, c: colIndex });
                const cell = worksheet[cellAddress];
                const style = cell?.s || {};  // Get the style object if available

                const bgColor = style?.fill?.bgColor?.rgb;
                const fontColor = style?.font?.color?.rgb;
                const fontWeight = style?.font?.bold ? 'bold' : 'normal';
                const fontSize = style?.font?.sz;
                const borderColor = style?.border?.top?.color?.rgb;

                return { bgColor, fontColor, fontWeight, fontSize, borderColor };
            })
        );

        setTableData(jsonData);
        renderTable(jsonData, styleData, workbook, worksheet);
    };

    const renderTable = (data, styleData, workbook, worksheet) => {
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
            cells: (row, col) => {
                const cellProperties = {};
                const cellStyle = styleData[row]?.[col];

                if (cellStyle) {
                    // Set background color
                    if (cellStyle.bgColor) {
                        cellProperties.renderer = function (instance, td) {
                            Handsontable.renderers.TextRenderer.apply(this, arguments);
                            td.style.backgroundColor = `#${cellStyle.bgColor}`;
                        };
                    }

                    // Set font color
                    if (cellStyle.fontColor) {
                        cellProperties.renderer = function (instance, td) {
                            Handsontable.renderers.TextRenderer.apply(this, arguments);
                            td.style.color = `#${cellStyle.fontColor}`;
                        };
                    }

                    // Set font weight
                    if (cellStyle.fontWeight) {
                        cellProperties.renderer = function (instance, td) {
                            Handsontable.renderers.TextRenderer.apply(this, arguments);
                            td.style.fontWeight = cellStyle.fontWeight;
                        };
                    }

                    // Set font size
                    if (cellStyle.fontSize) {
                        cellProperties.renderer = function (instance, td) {
                            Handsontable.renderers.TextRenderer.apply(this, arguments);
                            td.style.fontSize = `${cellStyle.fontSize}px`;
                        };
                    }

                    // Set border color
                    if (cellStyle.borderColor) {
                        cellProperties.renderer = function (instance, td) {
                            Handsontable.renderers.TextRenderer.apply(this, arguments);
                            td.style.borderColor = `#${cellStyle.borderColor}`;
                        };
                    }
                }
                return cellProperties;
            },
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
            title: 'Are you sure?',
            text: 'Once deleted, you will not be able to recover this template!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'No, keep it',
        }).then((result) => {
            if (result.isConfirmed) {
                deleteTemplate(id);
            }
        });
    };

    const deleteTemplate = async (id) => {
        try {
            await axios.delete(`http://localhost:8080/api/templates/${id}`);
            setTemplates(templates.filter((template) => template.id !== id));
            Swal.fire('Deleted!', 'Your template has been deleted.', 'success');
        } catch (error) {
            console.error('Error deleting template:', error);
            Swal.fire('Error', 'Unable to delete the template.', 'error');
        }
    };

    return (
        <div className="container mx-auto px-4 py-6">
            <UploadTemplate />
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Template List</h2>
            <table className="min-w-full bg-white border border-gray-200 shadow-md rounded-lg">
                <thead>
                <tr className="bg-gray-100">
                    <th className="py-2 px-4 border-b">Name</th>
                    <th className="py-2 px-4 border-b">Actions</th>
                </tr>
                </thead>
                <tbody>
                {templates.map((template) => (
                    <tr key={template.id} className="hover:bg-gray-50">
                        <td className="py-2 px-4 border-b">{template.name}</td>
                        <td className="py-2 px-4 border-b">
                            <button
                                onClick={() => handleDownload(template.id)}
                                className="bg-blue-500 text-white px-3 py-1 rounded-md mr-2 hover:bg-blue-600"
                            >
                                Download
                            </button>
                            <button
                                onClick={() => handleView(template.id)}
                                className="bg-green-500 text-white px-3 py-1 rounded-md mr-2 hover:bg-green-600"
                            >
                                View
                            </button>
                            <button
                                onClick={() => handleDelete(template.id)}
                                className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600"
                            >
                                Delete
                            </button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>

            <div className="mt-6">
                <label htmlFor="sheetSelector" className="block text-gray-700 font-medium">
                    Select Sheet:
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

            <div id="handsontable" className="mt-6"></div>
        </div>
    );
};

export default TemplateList;
