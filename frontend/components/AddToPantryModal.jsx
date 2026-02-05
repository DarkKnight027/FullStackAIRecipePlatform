"use client";
import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Camera, Plus, Save } from 'lucide-react';

const AddToPantryModal = ({ isOpen, onClose, onSuccess }) => {
    const [activeTab, setActiveTab] = useState('manual'); // Default to manual for now
    const [manualItem, setManualItem] = useState({ name: '', quantity: '' });
    
    const handleClose = () => { 
        setActiveTab('manual');
        setManualItem({ name: '', quantity: '' });
        onClose();
    };

    const handleAdd = () => {
        if (!manualItem.name || !manualItem.quantity) return;
        onSuccess(manualItem); // Pass the data back to the parent
        handleClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="bg-white rounded-[2.5rem] border-none shadow-2xl max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-black text-stone-900">Add to Pantry</DialogTitle>
                    <DialogDescription className="text-stone-500">
                        {activeTab === 'scan' ? "Take a photo of your ingredient." : "Enter ingredient details manually."}
                    </DialogDescription>
                </DialogHeader>

                {/* TABS */}
                <div className="flex bg-stone-100 p-1 rounded-xl mb-4">
                    <button 
                        onClick={() => setActiveTab('scan')}
                        className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'scan' ? 'bg-white shadow-sm text-orange-600' : 'text-stone-500'}`}
                    >
                        <Camera className="w-4 h-4 inline mr-2" /> Scan
                    </button>
                    <button 
                        onClick={() => setActiveTab('manual')}
                        className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'manual' ? 'bg-white shadow-sm text-orange-600' : 'text-stone-500'}`}
                    >
                        <Plus className="w-4 h-4 inline mr-2" /> Manual
                    </button>
                </div>

                {activeTab === 'manual' && (
                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-stone-400">Ingredient Name</label>
                            <Input 
                                placeholder="e.g. Greek Yogurt" 
                                className="rounded-xl border-stone-200"
                                value={manualItem.name}
                                onChange={(e) => setManualItem({...manualItem, name: e.target.value})}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-stone-400">Quantity</label>
                            <Input 
                                placeholder="e.g. 2 packs" 
                                className="rounded-xl border-stone-200"
                                value={manualItem.quantity}
                                onChange={(e) => setManualItem({...manualItem, quantity: e.target.value})}
                            />
                        </div>
                    </div>
                )}

                {activeTab === 'scan' && (
                    <div className="py-10 border-2 border-dashed border-stone-200 rounded-2xl flex flex-col items-center justify-center text-stone-400">
                        <Camera size={40} className="mb-2 opacity-20" />
                        <p className="text-sm font-medium">AI Vision coming soon...</p>
                    </div>
                )}

                <DialogFooter className="mt-6">
                    <Button variant="ghost" onClick={handleClose} className="rounded-xl font-bold">Cancel</Button>
                    <Button onClick={handleAdd} className="bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold px-8">
                        <Save className="w-4 h-4 mr-2" /> Save to Pantry
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default AddToPantryModal;