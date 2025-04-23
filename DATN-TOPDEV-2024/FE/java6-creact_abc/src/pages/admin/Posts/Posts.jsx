import React, { useRef } from 'react';
import PostTable from '../../../components/admin/TableForm/Posts/PostTable';

const AdminPostPage = () => {
    const postTableRef = useRef();


    return (
        <div className="p-4 bg-white rounded-lg shadow-md">
            <h1 className="text-2xl font-bold mb-4">Quản lý bài viết</h1>
            <PostTable ref={postTableRef}/>
        </div>
    );
};

export default AdminPostPage;
