"use client";
import { Package, Plus, Trash2, Edit2, Search, Utensils } from 'lucide-react';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import AddToPantryModal from '@/components/AddToPantryModal'; // IMPORT HERE

const PantryPage = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [items, setItems] = useState([
        { id: 1, name: 'All Purpose Flour', quantity: '2kg' },
        { id: 2, name: 'Extra Virgin Olive Oil', quantity: '500ml' }
    ]);

    // This handles the data coming back from the modal
    const handleAddItem = (newItem) => {
        setItems([...items, { id: Date.now(), ...newItem }]);
    };

    const handleDelete = (id) => {
        setItems(items.filter(item => item.id !== id));
    };

    return (
        <div className="min-h-screen bg-stone-50 pt-24 pb-16 px-4">
            <div className='container mx-auto max-w-5xl'>
                
                {/* HEADER */}
                <div className='flex items-center justify-between mb-12'>
                    <div className='flex items-center gap-4'>
                        <div className='p-4 bg-orange-100 rounded-3xl'>
                            <Package className='w-10 h-10 text-orange-600' />
                        </div>
                        <div>
                            <h1 className='text-4xl font-black text-stone-900 tracking-tight'>My Pantry</h1>
                            <p className='text-stone-500 font-medium'>Manage your ingredients</p>
                        </div>
                    </div>
                    <Button 
                        className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-6 rounded-2xl shadow-xl font-bold transition-all active:scale-95"
                        onClick={() => setIsModalOpen(true)}
                    >
                        <Plus className='w-5 h-5 mr-2' /> Add Item
                    </Button>
                </div>

                {/* GRID DISPLAY */}
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
                    {items.map((item) => (
                        <Card key={item.id} className="group border border-stone-200 bg-white rounded-3xl hover:border-orange-200 transition-all overflow-hidden">
                            <CardContent className="p-6">
                                <div className='flex justify-between items-start mb-4'>
                                    <Package className='w-6 h-6 text-stone-300 group-hover:text-orange-600 transition-colors' />
                                    <button onClick={() => handleDelete(item.id)} className="p-2 opacity-0 group-hover:opacity-100 text-stone-400 hover:text-red-600 transition-all">
                                        <Trash2 size={16}/>
                                    </button>
                                </div>
                                <h3 className='text-xl font-black text-stone-900 mb-1 capitalize'>{item.name}</h3>
                                <p className='text-orange-600 font-bold text-xs bg-orange-50 w-fit px-3 py-1 rounded-full'>{item.quantity}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* THE NEW MODAL COMPONENT */}
                <AddToPantryModal 
                    isOpen={isModalOpen} 
                    onClose={() => setIsModalOpen(false)} 
                    onSuccess={handleAddItem} 
                />

            </div>
        </div>
    );
};

export default PantryPage;