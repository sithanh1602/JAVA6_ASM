import React, { useState, useEffect } from 'react';
import ProductService from '../services/ProductService';
// Main Product Management Component
const ProductManagement = () => {
    const [products, setProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [productForm, setProductForm] = useState({
        name: '',
        description: '',
        price: ''
    });

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        const fetchedProducts = await ProductService.getAllProducts();
        setProducts(fetchedProducts);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProductForm((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (selectedProduct) {
            await ProductService.updateProduct(selectedProduct.id, productForm);
        } else {
            await ProductService.createProduct(productForm);
        }
        fetchProducts();
        resetForm();
    };

    const handleEdit = (product) => {
        setSelectedProduct(product);
        setProductForm(product);
    };

    const handleDelete = async (id) => {
        await ProductService.deleteProduct(id);
        fetchProducts();
    };

    const resetForm = () => {
        setSelectedProduct(null);
        setProductForm({ name: '', description: '', price: '' });
    };

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Product Management</h1>
            <form onSubmit={handleSubmit} className="mb-4 p-4 border border-gray-300 rounded shadow-lg bg-white">
                <h2 className="text-xl font-bold mb-4">{selectedProduct ? 'Edit Product' : 'Add Product'}</h2>
                <div className="mb-4">
                    <label className="block text-gray-700" htmlFor="name">Name:</label>
                    <input
                        className="mt-1 block w-full p-2 border border-gray-300 rounded"
                        type="text"
                        name="name"
                        id="name"
                        value={productForm.name}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700" htmlFor="description">Description:</label>
                    <textarea
                        className="mt-1 block w-full p-2 border border-gray-300 rounded"
                        name="description"
                        id="description"
                        value={productForm.description}
                        onChange={handleChange}
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700" htmlFor="price">Price:</label>
                    <input
                        className="mt-1 block w-full p-2 border border-gray-300 rounded"
                        type="number"
                        name="price"
                        id="price"
                        value={productForm.price}
                        onChange={handleChange}
                        required
                    />
                </div>
                <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition">
                    {selectedProduct ? 'Update Product' : 'Add Product'}
                </button>
            </form>
            <table className="min-w-full border border-gray-300 bg-white">
                <thead>
                    <tr className="bg-gray-200">
                        <th className="p-2 border">ID</th>
                        <th className="p-2 border">Name</th>
                        <th className="p-2 border">Description</th>
                        <th className="p-2 border">Price</th>
                        <th className="p-2 border">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {products.map((product) => (
                        <tr key={product.id} className="hover:bg-gray-100">
                            <td className="p-2 border">{product.id}</td>
                            <td className="p-2 border">{product.name}</td>
                            <td className="p-2 border">{product.description}</td>
                            <td className="p-2 border">${product.price}</td>
                            <td className="p-2 border">
                                <button
                                    onClick={() => handleEdit(product)}
                                    className="bg-yellow-500 text-white py-1 px-2 rounded hover:bg-yellow-600 transition mr-2"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(product.id)}
                                    className="bg-red-500 text-white py-1 px-2 rounded hover:bg-red-600 transition"
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ProductManagement;
