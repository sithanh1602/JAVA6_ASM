import React, { useState, useEffect } from 'react';
import ContactTable from '../../components/admin/TableForm/Contact/ContactTable';
import ContactService from '../../services/ContactService';
import {Box, Button, CircularProgress, Typography} from '@mui/material';

const AdminContactPage = () => {
    const [contacts, setContacts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchContacts = async () => {
        setIsLoading(true);
        try {
            const data = await ContactService.getAllContacts();
            setContacts(data);
            setError(null);
        } catch (error) {
            setError('Không thể tải danh sách liên hệ. Vui lòng thử lại sau.');
            console.error('Error fetching contacts:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchContacts();
    }, []);

    const handleUpdateContactStatus = (contactId) => {
        setContacts(prevContacts =>
            prevContacts.map(contact =>
                contact.id === contactId
                    ? { ...contact, status: true }
                    : contact
            )
        );
    };

    if (error) {
        return (
            <Box className="p-4">
                <Typography color="error" className="text-center">
                    {error}
                </Typography>
                <Button
                    variant="contained"
                    onClick={fetchContacts}
                    className="mt-4 mx-auto block"
                >
                    Thử lại
                </Button>
            </Box>
        );
    }

    return (
        <Box className="p-6 bg-white rounded-lg shadow-md">
            <Typography variant="h4" className="mb-4">
                Quản lý Liên hệ
            </Typography>

            {isLoading ? (
                <Box className="flex justify-center items-center min-h-[200px]">
                    <CircularProgress />
                </Box>
            ) : (
                <ContactTable
                    contacts={contacts}
                    fetchContacts={fetchContacts}
                    onUpdateContactStatus={handleUpdateContactStatus}
                />
            )}
        </Box>
    );
};

export default AdminContactPage;