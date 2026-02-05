"use client";
import React from 'react';
import { Cookie, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const MyRecipesPage = () => {
  return (
    <div className="min-h-screen bg-stone-50 pt-32 pb-16 px-4">
      <div className="container mx-auto max-w-5xl text-center">
        <div className="bg-orange-100 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <Cookie className="w-10 h-10 text-orange-600" />
        </div>
        <h1 className="text-4xl font-black text-stone-900 tracking-tight mb-4">My Saved Recipes</h1>
        <p className="text-stone-500 text-lg mb-8 max-w-md mx-auto">
          You haven't saved any recipes yet. Start exploring and build your personal cookbook!
        </p>
        <Link href="/dashboard">
          <Button className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-6 rounded-2xl font-bold shadow-lg shadow-orange-200 transition-all active:scale-95">
            Explore Recipes
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default MyRecipesPage;