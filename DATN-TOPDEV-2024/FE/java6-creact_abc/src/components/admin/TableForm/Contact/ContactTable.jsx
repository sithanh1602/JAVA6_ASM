import React, { useState } from 'react';
import DataTable from 'react-data-table-component';
import Swal from 'sweetalert2';
import ContactInput from './ContactInput';
import ContactService from '../../../../services/ContactService';
import {
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Typography,
    Button,
    Box,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const ContactTable = ({ contacts, fetchContacts, onUpdateContactStatus }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedContact, setSelectedContact] = useState(null);
    const [expandedContactId, setExpandedContactId] = useState(null);
    const [selectedContacts, setSelectedContacts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const handleOpenModal = (contact) => {
        setSelectedContact(contact);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setSelectedContact(null);
        setIsModalOpen(false);
    };

    const handleFeedbackSuccess = async (contactId) => {
        onUpdateContactStatus(contactId);
        await fetchContacts();
    };

    const handleAccordionToggle = (contactId) => {
        setExpandedContactId(expandedContactId === contactId ? null : contactId);
    };

    const handleSelectContact = (contactId) => {
        setSelectedContacts(prev =>
            prev.includes(contactId)
                ? prev.filter(id => id !== contactId)
                : [...prev, contactId]
        );
    };

    const handleSelectAll = () => {
        setSelectedContacts(prev =>
            prev.length === contacts.length ? [] : contacts.map(contact => contact.id)
        );
    };

    const handleDeleteSelected = async () => {
        if (selectedContacts.length === 0) {
            Swal.fire('Thông báo', 'Vui lòng chọn liên hệ để xóa!', 'info');
            return;
        }

        const result = await Swal.fire({
            title: 'Xác nhận xóa',
            text: 'Bạn có chắc chắn muốn xóa các liên hệ đã chọn?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Xóa',
            cancelButtonText: 'Hủy',
            confirmButtonColor: '#d33',
        });

        if (result.isConfirmed) {
            setIsLoading(true);
            try {
                await ContactService.deleteContactsByIds(selectedContacts);
                await fetchContacts();
                setSelectedContacts([]);
                Swal.fire('Thành công', 'Đã xóa các liên hệ đã chọn', 'success');
            } catch (error) {
                Swal.fire('Lỗi', 'Không thể xóa các liên hệ. Vui lòng thử lại sau.', 'error');
            } finally {
                setIsLoading(false);
            }
        }
    };

    const columns = [
        {
            name: 'Chọn',
            width: '80px',
            cell: row => (
                <input
                    type="checkbox"
                    checked={selectedContacts.includes(row.id)}
                    onChange={() => handleSelectContact(row.id)}
                    className="w-4 h-4"
                />
            ),
            ignoreRowClick: true,
        },
        {
            name: 'Tên',
            selector: row => row.fullName,
            sortable: true,
        },
        {
            name: 'Email',
            selector: row => row.email,
            sortable: true,
        },
        {
            name: 'Trạng thái',
            selector: row => row.status ? 'Đã xử lý' : 'Chờ xử lý',
            sortable: true,
            cell: row => (
                <span className={`px-2 py-1 rounded ${
                    row.status
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                }`}>
                    {row.status ? 'Đã xử lý' : 'Chờ xử lý'}
                </span>
            ),
        }
    ];

    const conditionalRowStyles = [
        {
            when: row => !row.status,
            style: {
                fontWeight: 'bold',
                backgroundColor: 'rgb(210, 210, 210)',
            },
        },
    ];

    return (
        <Box className="p-4">
            <Box className="mb-4 flex justify-between items-center">
                <Box className="flex gap-2">
                    <Button
                        variant="outlined"
                        onClick={handleSelectAll}
                        disabled={isLoading}
                    >
                        {selectedContacts.length === contacts.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                    </Button>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={handleDeleteSelected}
                        disabled={selectedContacts.length === 0 || isLoading}
                    >
                        {isLoading ? 'Đang xóa...' : 'Xóa đã chọn'}
                    </Button>
                </Box>
            </Box>

            <DataTable
                columns={columns}
                data={contacts}
                expandableRows
                expandableRowsComponent={({ data }) => (
                    <Accordion
                        expanded={expandedContactId === data.id}
                        onChange={() => handleAccordionToggle(data.id)}
                    >
                        <AccordionDetails>
                            <Box className="space-y-2">
                                <Typography><strong>Chi tiết liên hệ</strong></Typography>
                                <Typography><strong>Họ tên:</strong> {data.fullName}</Typography>
                                <Typography><strong>Số Điện Thoại:</strong> {data.phone}</Typography>
                                <Typography><strong>Email:</strong> {data.email}</Typography>
                                <Typography><strong>Nội dung:</strong> {data.message}</Typography>
                                <Box className="mt-4">
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={() => handleOpenModal(data)}
                                        disabled={data.status}
                                    >
                                        Gửi phản hồi
                                    </Button>
                                </Box>
                            </Box>
                        </AccordionDetails>
                    </Accordion>
                )}
                conditionalRowStyles={conditionalRowStyles}
                pagination
                highlightOnHover
                pointerOnHover
                responsive
            />

            <ContactInput
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                contact={selectedContact}
                onSuccess={handleFeedbackSuccess}
            />
        </Box>
    );
};

export default ContactTable;