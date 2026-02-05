import React from 'react';
import Link from 'next/link'; 
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, MapPin, ChefHat } from 'lucide-react';

const RecipeCard = ({ recipe, variant = "grid" }) => {
  const getRecipeData = () => {
    return {
      title: recipe.strMeal,
      image: recipe.strMealThumb,
      category: recipe.strCategory,
      area: recipe.strArea,
      href: `/recipe?cook=${encodeURIComponent(recipe.strMeal)}`,
    };
  };

  const recipeData = getRecipeData();

  return (
    <Link href={recipeData.href} className="group block">
      <Card className="overflow-hidden border-2 border-stone-800 bg-stone-900 shadow-2xl rounded-[2rem] transition-all duration-500 group-hover:-translate-y-2 group-hover:border-orange-500 group-hover:shadow-orange-900/20">
        
        {/* IMAGE SECTION */}
        <div className="relative h-60 overflow-hidden">
          <Image
            src={recipeData.image}
            alt={recipeData.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110 opacity-90 group-hover:opacity-100"
          />
          
          {/* Gradients to ensure text visibility on image */}
          <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-transparent to-transparent opacity-60" />
          
          <div className="absolute top-4 left-4 flex gap-2">
            <span className="bg-orange-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-white shadow-xl border border-orange-400/30">
              {recipeData.category}
            </span>
          </div>
        </div>
        
        {/* DARK CONTENT SECTION */}
        <CardContent className="p-6 bg-stone-900">
          <div className="flex items-center gap-2 text-[10px] font-bold text-orange-500 uppercase tracking-[0.2em] mb-3">
            <MapPin size={12} />
            {recipeData.area}
          </div>
          
          <h3 className="text-xl font-black text-white leading-tight mb-4 group-hover:text-orange-400 transition-colors line-clamp-2 min-h-[3rem]">
            {recipeData.title}
          </h3>
          
          <div className="flex items-center justify-between pt-4 border-t border-stone-800">
            <div className="flex items-center gap-2 text-stone-400 text-[10px] font-bold uppercase tracking-widest">
                <ChefHat size={14} className="text-stone-500" />
                View Recipe
            </div>
            <div className="w-8 h-8 rounded-full bg-stone-800 flex items-center justify-center text-white group-hover:bg-orange-600 group-hover:rotate-[-45deg] transition-all duration-300">
                <ArrowRight size={16} />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default RecipeCard;