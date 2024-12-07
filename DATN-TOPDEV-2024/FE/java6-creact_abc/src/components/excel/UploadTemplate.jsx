import React, { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import ExcelJS from 'exceljs';
import { Button, Typography, Box, TextField } from '@mui/material';

const UploadTemplate = () => {
    const [file, setFile] = useState(null);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleUpload = async () => {
        if (!file) {
            Swal.fire('Error', 'Please select a file.', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = async (event) => {
            const buffer = event.target.result;
            const workbook = new ExcelJS.Workbook();
            await workbook.xlsx.load(buffer);

            // Log sheet names to verify the sheets inside the workbook
            console.log("Sheet Names: ", workbook.worksheets.map(sheet => sheet.name));

            if (workbook.worksheets.length === 0) {
                Swal.fire('Error', 'No sheet found in the workbook.', 'error');
                return;
            }

            const sheet = workbook.getWorksheet(1); // Get the first sheet
            if (!sheet) {
                Swal.fire('Error', 'Unable to find the first sheet in the workbook.', 'error');
                return;
            }

            const jsonSheet = [];
            const styles = {};
            const merges = [];

            sheet.eachRow((row, rowIndex) => {
                const rowValues = [];
                row.eachCell((cell, colIndex) => {
                    rowValues.push(cell.value);
                    styles[`${rowIndex}-${colIndex}`] = {
                        fill: cell.fill,
                        font: cell.font,
                        border: cell.border,
                        alignment: cell.alignment,
                    };
                });
                jsonSheet.push(rowValues);
            });

            // Check if merges is available and is an array before calling forEach
            if (Array.isArray(sheet.merges)) {
                sheet.merges.forEach((merge) => {
                    merges.push({
                        start: { row: merge.top, col: merge.left },
                        end: { row: merge.bottom, col: merge.right },
                    });
                });
            }

            const formData = new FormData();
            formData.append('file', file);
            formData.append('styles', JSON.stringify(styles));
            formData.append('merges', JSON.stringify(merges));

            try {
                const response = await axios.post('http://localhost:8080/api/templates/upload', formData);
                Swal.fire('Success', response.data, 'success');
            } catch (error) {
                Swal.fire('Error', `Error uploading file: ${error.message}`, 'error');
            }
        };

        reader.readAsArrayBuffer(file);
    };

    return (
        <Box sx={{ maxWidth: 400, mx: 'auto', p: 3, boxShadow: 3, borderRadius: 2, backgroundColor: 'white' }}>
            <Typography variant="h4" align="center" gutterBottom>
                Upload Template
            </Typography>
            <Box mb={2}>
                <TextField
                    type="file"
                    fullWidth
                    onChange={handleFileChange}
                    InputLabelProps={{ shrink: true }}
                />
            </Box>
            <Button
                fullWidth
                variant="contained"
                color="primary"
                onClick={handleUpload}
            >
                Upload
            </Button>
        </Box>
    );
};

export default UploadTemplate;
