import React, { useRef } from 'react';
import PostTable from '../../../components/admin/TableForm/Posts/TagTable';

const PostTag = () => {
    const TagTableRef = useRef();

    return (
        <div className="p-4 bg-white rounded-lg shadow-md">
            <h1 className="text-2xl font-bold mb-4">Quản lý Tag</h1>
            <PostTable ref={TagTableRef}/>
        </div>
    );
};

export default PostTag;
