"use client";

import useFetch from '@/hooks/useFetch';
import { ArrowLeft, UtensilsCrossed, Search, X, SortAsc, SortDesc, ArrowUp } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

const SkeletonCard = () => (
  <Card className="overflow-hidden border-none shadow-sm bg-white rounded-3xl animate-pulse">
    <div className="relative h-56 bg-stone-200" />
    <CardContent className="p-6 space-y-3">
      <div className="h-4 bg-stone-200 rounded w-3/4" />
      <div className="h-4 bg-stone-200 rounded w-1/2" />
      <div className="pt-4 h-3 bg-stone-100 rounded w-1/4" />
    </CardContent>
  </Card>
);

const RecipeGrid = ({ type, value, fetchAction, backLink = "/dashboard" }) => {
  // Ensure useFetch is imported correctly from the fixed file above
  const { data, loading, fn: fetchMeals } = useFetch(fetchAction);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("asc"); 
  const [showTopBtn, setShowTopBtn] = useState(false);

  useEffect(() => {
    if (value) {
      const formattedValue = value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
      fetchMeals(formattedValue);
    }
  }, [value, fetchMeals]);

  useEffect(() => {
    const handleScroll = () => setShowTopBtn(window.scrollY > 400);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const meals = data?.meals || [];
  const displayName = value?.replace(/_/g, ' ');

  const processedMeals = [...meals] // Spread into new array to avoid mutating original if needed
    .filter((meal) => meal.strMeal.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      return sortOrder === "asc" 
        ? a.strMeal.localeCompare(b.strMeal) 
        : b.strMeal.localeCompare(a.strMeal);
    });

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <div className='min-h-screen bg-stone-50 pt-24 pb-16 px-4 md:px-8'>
      <div className='container mx-auto max-w-7xl'>
        
        {/* HEADER SECTION */}
        <div className='flex flex-col xl:flex-row xl:items-end justify-between gap-8 mb-12'>
          <div className="flex-1">
            <Link 
              href={backLink} 
              className="text-stone-500 hover:text-orange-600 transition-colors flex items-center gap-2 font-medium text-sm mb-6 w-fit"
            >
              <ArrowLeft size={16} />
              Back to Dashboard
            </Link>
            
            <h1 className='text-4xl md:text-5xl font-black tracking-tight'>
              <span className='text-orange-600 capitalize'>{displayName}</span>
              <span className='text-stone-900'>{type === "cuisine" ? " Cuisine" : " Recipes"}</span>
            </h1>

            {!loading && (
              <p className='text-stone-500 font-medium mt-3 flex items-center gap-2'>
                <UtensilsCrossed size={16} className="text-orange-600" />
                {processedMeals.length} recipes found
              </p>
            )}
          </div>

          {!loading && meals.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto">
                <div className="relative w-full sm:w-72 group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400 group-focus-within:text-orange-600" />
                    <input 
                        type="text"
                        placeholder={`Filter ${displayName}...`}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-10 py-3 border border-stone-200 focus:outline-none focus:ring-2 focus:ring-orange-600/20 focus:border-orange-600 rounded-2xl bg-white shadow-sm text-sm"
                    />
                    {searchTerm && (
                        <button onClick={() => setSearchTerm("")} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-stone-100 rounded-full">
                            <X size={14} className="text-stone-400" />
                        </button>
                    )}
                </div>

                <Button 
                    variant="outline"
                    onClick={() => setSortOrder(prev => prev === "asc" ? "desc" : "asc")}
                    className="w-full sm:w-auto border-stone-200 text-stone-600 font-bold px-6 py-6 rounded-2xl bg-white hover:bg-stone-50 flex items-center gap-2"
                >
                    {sortOrder === "asc" ? <SortAsc size={18} /> : <SortDesc size={18} />}
                    {sortOrder === "asc" ? "A-Z" : "Z-A"}
                </Button>
            </div>
          )}
        </div>

        {/* GRID SECTION */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8'>
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
          ) : (
            processedMeals.map((meal) => (
              <Link key={meal.idMeal} href={`/recipe?cook=${encodeURIComponent(meal.strMeal)}`} className="group">
                <Card className="overflow-hidden border-none shadow-lg shadow-stone-200/50 bg-white rounded-3xl transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-orange-200/40">
                  <div className="relative h-56 overflow-hidden">
                    <Image src={meal.strMealThumb} alt={meal.strMeal} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-bold text-stone-900 leading-tight group-hover:text-orange-600 transition-colors line-clamp-2">{meal.strMeal}</h3>
                    <div className="mt-4 flex items-center text-xs font-black uppercase tracking-widest text-orange-600">
                      View Recipe <ArrowLeft className="rotate-180 ml-1 w-3 h-3 transition-transform group-hover:translate-x-1" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          )}
        </div>

        {showTopBtn && (
            <button 
                onClick={scrollToTop}
                className="fixed bottom-8 right-8 p-4 bg-orange-600 text-white rounded-full shadow-2xl hover:bg-orange-700 transition-all z-50"
            >
                <ArrowUp size={20} />
            </button>
        )}

        {/* Corrected Empty State logic */}
        {!loading && processedMeals.length === 0 && (
             <div className="flex flex-col items-center justify-center py-20 text-center w-full col-span-full">
                <Search className="w-12 h-12 text-stone-200 mb-4" />
                <h3 className="text-lg font-bold text-stone-800">No matches for "{searchTerm}"</h3>
                <Button variant="ghost" onClick={() => setSearchTerm("")} className="mt-4 text-orange-600 font-bold">Clear search</Button>
             </div>
        )}
      </div>
    </div>
  );
};

export default RecipeGrid;