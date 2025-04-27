import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import DashService from '../../../services/DashService';
import { FaUserCircle } from 'react-icons/fa';

const TopCustomersDonutChart = () => {
  const [data, setData] = useState([]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28EFF'];

  useEffect(() => {
    const fetchTopCustomers = async () => {
      const customers = await DashService.getTop3Customers();
      setData(customers);
    };

    fetchTopCustomers();
  }, []);

  const getTotalSpent = () => data.reduce((sum, customer) => sum + customer.totalSpent, 0);

  return (
    <div className="p-4 w-full max-w-lg mx-auto">
      <h2 className="m-0 font-weight-bold text-primary pb-9 text-center" style={{ fontSize: '0.85rem' }}>Top {data.length} khách hàng</h2>
      <div className="flex flex-col sm:flex-row gap-6 sm:gap-4">
        {/* Donut Chart */}
        <div style={{ width: 160, height: 160 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="totalSpent"
                nameKey="fullName"
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={60}
                paddingAngle={3}
                label={false}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => new Intl.NumberFormat('vi-VN').format(value) + ' VNĐ'}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Customer List */}
        <div className="flex flex-col gap-3 w-full sm:w-auto">
          {data.map((customer, index) => (
            <div key={index} className="flex items-center gap-3">
              <span
                className="inline-block w-2 h-2 rounded-full"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              ></span>
              {customer.image ? (
                <img
                  src={customer.image}
                  alt={customer.fullName}
                  className="w-6 h-6 rounded-full object-cover"
                />
              ) : (
                <FaUserCircle className="w-6 h-6 text-gray-400" />
              )}
              <div className="flex flex-col">
                <span className="text-sm font-medium">{customer.fullName}</span>
                <span className="text-xs text-gray-500">
                  {((customer.totalSpent / getTotalSpent()) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TopCustomersDonutChart;
