import React, { useRef } from 'react';
import PostTable from '../../../components/admin/TableForm/Posts/PostCategoryTable';

const PostCategory = () => {
    const PostCategoryTableRef = useRef();

    return (
        <div className="p-4 bg-white rounded-lg shadow-md">
            <h1 className="text-2xl font-bold mb-4">Quản lý danh mục bài viết</h1>
            <PostTable ref={PostCategoryTableRef}/>
        </div>
    );
};

export default PostCategory;
