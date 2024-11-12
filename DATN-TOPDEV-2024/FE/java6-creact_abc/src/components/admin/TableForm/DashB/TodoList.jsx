import React from 'react';

const TodoList = () => {
    const todos = [
        { text: 'Call John for Dinner', status: '2 Days', color: 'bg-green-500' },
        { text: 'Book Boss Flight', status: '3 Minutes', color: 'bg-red-500' },
        { text: 'Hit the Gym', status: 'not important', color: 'bg-yellow-500' },
        { text: 'Give Purchase Report', status: 'Tomorrow', color: 'bg-blue-500' },
        { text: 'Watch Game of Thrones Episode', status: 'Tomorrow', color: 'bg-blue-500' },
        { text: 'Give Purchase report', status: 'Done', color: 'bg-green-500' },
    ];

    return (
        <div className="bg-white p-6 rounded-lg shadow-md w-1/3">
            <h2 className="text-lg font-semibold mb-4">Todo List</h2>
            <ul className="space-y-4">
                {todos.map((todo, index) => (
                    <li key={index} className="flex justify-between items-center">
                        <span>{todo.text}</span>
                        <span className={`${todo.color} text-white text-xs px-2 py-1 rounded`}>
                            {todo.status}
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default TodoList;
