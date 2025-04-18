import React, { useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';

const Callback = () => {
    const { isLoading } = useAuth0();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isLoading) {
            navigate('/');
        }
    }, [isLoading, navigate]);

    return <div>Loading...</div>;
};

export default Callback;