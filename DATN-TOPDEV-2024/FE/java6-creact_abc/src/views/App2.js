import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HorizontalMenu from "../components/admin/HorizontalMenu";
import VerticalMenu from "../components/admin/VerticalMenu";
import UserInput from '../components/admin/TableForm/Users/UserInput';
import UserTable from '../components/admin/TableForm/Users/UserTable';
import ProductInput from '../components/admin/TableForm/Products/ProductInput';
import ProductTable from '../components/admin/TableForm/Products/ProductTable';
import BrandInput from "../components/admin/TableForm/Brands/BrandInput";
import BrandTable from "../components/admin/TableForm/Brands/BrandTable";
import CategoryInput from "../components/admin/TableForm/Categories/CategoryInput";
import CategoryTable from "../components/admin/TableForm/Categories/CategoryTable";

const App2 = () => {
    return (
        <Router>
            <HorizontalMenu />
            <VerticalMenu />
                    <Routes>
                        {/*<Route path="/fa" element={<UserInput />} />*/}
                        {/*<Route path="/fb" element={<UserTable />} />*/}
                        {/*<Route path="/fc" element={<ProductInput />} />*/}
                        {/*<Route path="/fd" element={<ProductTable />} />*/}
                        {/*<Route path="/fe" element={<BrandInput />} />*/}
                        {/*<Route path="/ff" element={<BrandTable />} />*/}
                        {/*<Route path="/fg" element={<CategoryInput />} />*/}
                        {/*<Route path="/fh" element={<CategoryTable />} />*/}
                    </Routes>
        </Router>
    );
};


export default App2;