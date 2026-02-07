/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  ChefHat,
  Loader2,
  Package,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import useFetch from "@/hooks/useFetch";
import {
  getPantryItems,
  deletePantryItem,
  updatePantryItem,
} from "@/actions/pantry.actions";
import { toast } from "sonner";
import AddToPantryModal from "@/components/AddToPantryModal";
import PricingModal from "@/components/PricingModal";

export default function PantryPage() {
  const [items, setItems] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({ name: "", quantity: "" });
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch pantry items
  const {
    loading: loadingItems,
    data: itemsData,
    fn: fetchItems,
  } = useFetch(getPantryItems);

  // Delete item
  const {
    loading: deleting,
    data: deleteData,
    fn: deleteItem,
  } = useFetch(deletePantryItem);

  // Update item
  const {
    loading: updating,
    data: updateData,
    fn: updateItem,
  } = useFetch(updatePantryItem);

  // Load items on mount
  useEffect(() => {
    fetchItems();
  }, []);

  // FIXED: The action now returns the array directly, not an object with .success
  useEffect(() => {
    if (itemsData) {
      // If itemsData is an array, set it. If it's the old object format, handle both.
      const pantryItems = Array.isArray(itemsData) ? itemsData : itemsData.items || [];
      setItems(pantryItems);
    }
  }, [itemsData]);

  // Refresh after delete
  useEffect(() => {
    if (deleteData?.success && !deleting) {
      toast.success("Item removed from pantry");
      fetchItems();
    }
  }, [deleteData, deleting]);

  // Refresh after update
  useEffect(() => {
    if (updateData?.success) {
      toast.success("Item updated successfully");
      setEditingId(null);
      fetchItems();
    }
  }, [updateData]);

  // Handle delete
  const handleDelete = async (itemId) => {
    await deleteItem(itemId); // Server action takes the ID directly
  };

  // Start editing
  const startEdit = (item) => {
    setEditingId(item.id || item.documentId);
    setEditValues({
      name: item.name,
      quantity: item.quantity,
    });
  };

  // Save edit
  const saveEdit = async () => {
    const formData = new FormData();
    formData.append("name", editValues.name);
    formData.append("quantity", editValues.quantity);
    await updateItem(editingId, formData);
  };

  // Cancel edit
  const cancelEdit = () => {
    setEditingId(null);
    setEditValues({ name: "", quantity: "" });
  };

  // Handle modal success (refresh items)
  const handleModalSuccess = () => {
    fetchItems();
  };

  return (
    <div className="min-h-screen bg-stone-50 pt-24 pb-16 px-4">
      <div className="container mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Package className="w-12 h-12 text-orange-600" />
              <div>
                <h1 className="text-4xl font-bold text-stone-900 tracking-tight">
                  My Pantry
                </h1>
                <p className="text-stone-600 font-light">
                  Manage your ingredients and discover what you can cook
                </p>
              </div>
            </div>

            <Button
              onClick={() => setIsModalOpen(true)}
              className="hidden md:flex bg-orange-600 hover:bg-orange-700 text-white gap-2"
              size="lg"
            >
              <Plus className="w-5 h-5" />
              Add to Pantry
            </Button>
          </div>

          {/* Pricing Modal & Hydration Fix */}
          <div className="bg-white py-3 px-4 border-2 border-stone-200 inline-flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-orange-600" />
            <div className="text-sm">
                <PricingModal>
                  {/* We wrap the trigger text in a span so PricingModal's DialogTrigger asChild works */}
                  <span className="text-stone-500 cursor-pointer hover:text-orange-600 underline underline-offset-4">
                    View Plan Limits & Upgrade to Pro
                  </span>
                </PricingModal>
            </div>
          </div>
        </div>

        {/* Quick Action Card - Find Recipes */}
        {items.length > 0 && (
          <Link href="/pantry/recipes" className="block mb-8">
            <div className="bg-emerald-600 text-white p-6 border-2 border-emerald-700 hover:shadow-xl transition-all cursor-pointer group">
              <div className="flex items-center gap-4">
                <ChefHat className="w-8 h-8" />
                <div className="flex-1">
                  <h3 className="font-bold text-xl mb-1">What Can I Cook Today?</h3>
                  <p className="text-emerald-50 text-sm">
                    Get AI recipe suggestions from your {items.length} ingredients
                  </p>
                </div>
              </div>
            </div>
          </Link>
        )}

        {/* Loading State */}
        {loadingItems && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-orange-600 animate-spin mb-4" />
            <p className="text-stone-500">Loading your pantry...</p>
          </div>
        )}

        {/* Pantry Items Grid */}
        {!loadingItems && items.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
            {items.map((item) => (
              <div
                key={item.id || item.documentId}
                className="bg-white p-5 border-2 border-stone-200 hover:border-orange-600 transition-all"
              >
                {editingId === (item.id || item.documentId) ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={editValues.name}
                      onChange={(e) => setEditValues({ ...editValues, name: e.target.value })}
                      className="w-full px-3 py-2 border border-stone-200"
                    />
                    <input
                      type="text"
                      value={editValues.quantity}
                      onChange={(e) => setEditValues({ ...editValues, quantity: e.target.value })}
                      className="w-full px-3 py-2 border border-stone-200"
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={saveEdit} className="bg-green-600">Save</Button>
                      <Button size="sm" variant="outline" onClick={cancelEdit}>Cancel</Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-stone-900">{item.name}</h3>
                      <p className="text-stone-500 text-sm">{item.quantity}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => startEdit(item)} className="text-stone-400 hover:text-orange-600">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(item.id || item.documentId)} className="text-stone-400 hover:text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loadingItems && items.length === 0 && (
          <div className="bg-white p-12 text-center border-2 border-dashed border-stone-200 mt-8">
            <h3 className="text-2xl font-bold text-stone-900 mb-2">Your Pantry is Empty</h3>
            <p className="text-stone-600 mb-8">Start by scanning ingredients or adding them manually.</p>
            <Button onClick={() => setIsModalOpen(true)} className="bg-orange-600">
              Add Your First Item
            </Button>
          </div>
        )}
      </div>

      <AddToPantryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
}