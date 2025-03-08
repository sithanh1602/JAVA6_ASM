import React, { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import DataTable from 'react-data-table-component';
import Modal from 'react-modal';
import PostInput from './PostInput';
import PostService from '../../../../services/PostService';
import Swal from 'sweetalert2';
import { FaEdit } from 'react-icons/fa';
import { FiRefreshCw } from 'react-icons/fi';

const PostsTable = forwardRef((_, ref) => {
    const [posts, setPosts] = useState([]);
    const [filteredPost, setFilteredPost] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPost, setSelectedPost] = useState(null);
    const [searchName, setSearchName] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    useEffect(() => {
        fetchPosts();
    }, []);

    useImperativeHandle(ref, () => ({
        fetchPosts,
    }));

    const fetchPosts = async () => {
        try {
            const allPosts = await PostService.getAllPosts();
            const validPosts = allPosts.filter(post => post.title);
            setPosts(validPosts);
            setFilteredPost(validPosts);
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to fetch posts!',
            });
            console.error('Error fetching posts:', error);
        }
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        fetchPosts();
    };

    const handleAddPosts = () => {
        setSelectedPost(null);
        setIsModalOpen(true);
    };

    const handleEditPost = (post) => {
        setSelectedPost(post);
        setIsModalOpen(true);
    };

    const handleDelete = async (id, currentPostDetails) => {
        try {
            const updatedPostDetails = {
                ...currentPostDetails,
                status: !currentPostDetails.status,
            };

            await PostService.updatePost(id, updatedPostDetails);

            Swal.fire({
                icon: 'success',
                title: 'Success',
                text: `Post status updated to ${updatedPostDetails.status ? 'active' : 'inactive'}!`,
            });

            fetchPosts();
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to update post status!',
            });
            console.error('Error updating post status:', error);
        }
    };

    const filterPost = () => {
        const filtered = posts.filter((post) => {
            const nameMatch = post.title && post.title.toLowerCase().includes(searchName.toLowerCase());
            const statusMatch = statusFilter !== "" ? post.status === (statusFilter === "true") : true;

            return nameMatch && statusMatch;
        });

        setFilteredPost(filtered);
    };

    useEffect(() => {
        filterPost();
    }, [statusFilter, searchName, posts]);

    const columns = [
        {
            name: 'Tiêu đề bài viết',
            selector: (row) => row.title || '',
            sortable: true,
        },
        {
            name: 'Nội dung',
            selector: (row) => row.content || '',
            sortable: true,
            cell: (row) => {
                const maxLength = 100;
                const content = row.content || '';
                const displayContent = content.length > maxLength ? content.substring(0, maxLength) + '...' : content;

                return <span title={content}>{displayContent}</span>;
            }
        },
        {
            name: 'Ảnh',
            selector: (row) => row.image,
            cell: (row) => (
                row.image ? (
                    <img
                        src={row.image}
                        className="h-12 w-14 object-cover rounded"
                    />
                ) : (
                    <span className="text-gray-500">No image</span>
                )
            ),
        },
        {
            name: 'Trạng Thái',
            selector: (row) => row.status,
            cell: (row) => {
                const isActive = row.status;
                const statusDisplay = isActive ? 'Còn hoạt động' : 'Hết hoạt động';
                return (
                    <span
                        className={`px-2 py-1 rounded text-white ${
                            isActive ? 'bg-green-500' : 'bg-yellow-500'
                        }`}
                    >
                        {statusDisplay}
                    </span>
                );
            },
        },
        {
            name: 'Hành động',
            cell: (row) => (
                <div className="flex space-x-2">
                    <button
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                        onClick={() => handleEditPost(row)}
                    >
                        <FaEdit />
                    </button>
                    <button
                        className={`px-2 py-1 rounded ${
                            row.status === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-500 text-white hover:bg-red-600'
                        }`}
                        onClick={() => row.status !== 0 && handleDelete(row.id, row)}
                        disabled={row.status === 0}
                    >
                        <FiRefreshCw />
                    </button>
                </div>
            ),
        },
    ];

    return (
        <div className="p-4 bg-white">
            <Modal
                isOpen={isModalOpen}
                onRequestClose={handleModalClose}
                ariaHideApp={false}
                className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl transition-opacity duration-300 ease-out"
                overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
            >
                <div className="h-full w-full bg-white p-6 rounded-lg flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">
                            {selectedPost ? 'Cập nhật bài viết' : 'Thêm bài viết mới'}
                        </h2>
                        <button
                            onClick={handleModalClose}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            <span className="text-xl">×</span>
                        </button>
                    </div>
                    <PostInput post={selectedPost} onSave={handleModalClose} />
                </div>
            </Modal>

            <div className="flex justify-between items-center mb-4">
                <button
                    className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
                    onClick={handleAddPosts}
                >
                    + Thêm bài viết
                </button>
            </div>

            <div className="mb-4 flex space-x-2">
                <input
                    type="text"
                    className="border border-gray-300 px-4 py-2 rounded"
                    placeholder="Tìm kiếm theo tên..."
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                    onKeyUp={filterPost}
                />
                <select
                    className="border border-gray-300 px-4 py-2 rounded"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="">Trạng thái</option>
                    <option value="true">Còn Hoạt Động</option>
                    <option value="false">Hết Hoạt Động</option>
                </select>
            </div>

            <DataTable
                title="Danh sách bài viết"
                columns={columns}
                data={filteredPost}
                pagination
                highlightOnHover
                responsive
            />
        </div>
    );
});

export default PostsTable;