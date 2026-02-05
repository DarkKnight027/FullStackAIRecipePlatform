import { getAreas, getCategories, getRecipeOfTheDay } from '@/actions/mealdb.actions';
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Utensils, 
  MapPin, 
  Sparkles, 
  History, 
  Heart,
  Refrigerator,
  Search,
  Activity,
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

// Import helpers from your data file
import { getCategoryEmoji, getCountryFlag } from '@/lib/data';

const DashboardPage = async () => {
  const recipeData = await getRecipeOfTheDay();
  const categoriesData = await getCategories();
  const areasData = await getAreas();

  const recipeOfTheDay = recipeData?.recipe;
  const categories = categoriesData?.categories || [];
  const areas = areasData?.areas || []; 

  return (
    <div className='min-h-screen bg-stone-50 pt-24 pb-16 px-4 md:px-8'>
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* 1. WELCOME HEADER & SEARCH */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-extrabold text-stone-900 tracking-tight mb-2">
              Welcome back, Chef
            </h1>
            <p className="text-stone-500 font-medium italic">Your personalized Swadistt kitchen is ready.</p>
          </div>
          
          <div className="relative w-full md:w-80 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400 group-focus-within:text-orange-600 transition-colors" />
            <input 
              type="text"
              placeholder="Search recipes..." 
              className="w-full pl-10 pr-4 py-2.5 border border-stone-200 focus:outline-none focus:ring-2 focus:ring-orange-600/20 focus:border-orange-600 rounded-xl bg-white shadow-sm text-sm transition-all"
            />
          </div>
        </header>

        {/* 2. TOP SECTION: Featured & Kitchen Health */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* DAILY INSPIRATION */}
          <div className="lg:col-span-8">
            <Link href={`/recipe?cook=${encodeURIComponent(recipeOfTheDay?.strMeal || "")}`}>
              <Card className="overflow-hidden border-none shadow-xl shadow-stone-200/50 bg-white group cursor-pointer hover:shadow-orange-200/40 transition-all duration-500 rounded-3xl h-full">
                <div className="grid grid-cols-1 md:grid-cols-2 h-full">
                  <div className="relative h-64 md:h-full overflow-hidden">
                    {recipeOfTheDay?.strMealThumb ? (
                      <Image 
                        src={recipeOfTheDay.strMealThumb}
                        alt={recipeOfTheDay.strMeal}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full bg-stone-200 animate-pulse" />
                    )}
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition-colors" />
                    <div className="absolute top-4 left-4 z-20">
                      <Badge className="bg-orange-600 text-white border-none px-3 py-1 flex items-center gap-1 shadow-lg font-bold">
                        <Sparkles className="w-3 h-3 fill-white" />
                        Daily Inspiration
                      </Badge>
                    </div>
                  </div>

                  <div className="p-8 flex flex-col justify-center">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-orange-600 font-bold uppercase tracking-[0.2em] text-[10px] bg-orange-50 px-2 py-1 rounded">
                        {recipeOfTheDay?.strCategory}
                      </span>
                      <span className="flex items-center gap-1 text-stone-400 text-xs font-medium">
                        <MapPin className="w-3 h-3" /> {recipeOfTheDay?.strArea}
                      </span>
                    </div>
                    <h2 className="text-3xl font-black text-stone-900 tracking-tight mb-4 group-hover:text-orange-600 transition-colors">
                      {recipeOfTheDay?.strMeal}
                    </h2>
                    <p className="text-stone-500 text-sm leading-relaxed mb-6 line-clamp-3 italic">
                      &quot;{recipeOfTheDay?.strInstructions?.substring(0, 150)}...&quot;
                    </p>
                    <Button className="bg-orange-600 hover:bg-orange-700 text-white rounded-full w-fit px-8 font-bold shadow-lg shadow-orange-100 transition-all active:scale-95">
                      Start Cooking
                    </Button>
                  </div>
                </div>
              </Card>
            </Link>
          </div>

          {/* KITCHEN HEALTH SIDEBAR */}
          <div className="lg:col-span-4">
            <Card className="border border-stone-200 shadow-xl bg-white rounded-3xl h-full flex flex-col overflow-hidden">
                <CardHeader className="pb-4 border-b border-stone-100 bg-stone-50/80">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-extrabold flex items-center gap-2 text-stone-900 uppercase tracking-tight">
                            <Refrigerator className="w-5 h-5 text-orange-600" />
                            Kitchen Health
                        </CardTitle>
                        <Badge className="bg-orange-600 text-white border-none font-black text-[10px] px-2 py-0.5 shadow-sm">PRO</Badge>
                    </div>
                </CardHeader>
                
                <CardContent className="flex-grow p-6 space-y-8">
                    <div>
                        <div className="flex justify-between text-[11px] mb-2 font-black uppercase tracking-[0.1em] text-stone-600">
                            <span>Pantry Stock</span>
                            <span className="text-orange-600 font-black">72% Full</span>
                        </div>
                        <div className="h-4 bg-stone-100 rounded-full overflow-hidden border border-stone-200 p-[2px]">
                            <div className="h-full bg-gradient-to-r from-orange-500 to-orange-700 rounded-full transition-all duration-1000" style={{ width: '72%' }} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-stone-50 p-4 rounded-2xl border-2 border-stone-100 text-center">
                            <p className="text-stone-500 text-[10px] font-black uppercase tracking-widest mb-1">Recipes</p>
                            <p className="text-3xl font-black text-stone-900">12</p>
                        </div>
                        <div className="bg-stone-50 p-4 rounded-2xl border-2 border-stone-100 text-center">
                            <p className="text-stone-500 text-[10px] font-black uppercase tracking-widest mb-1">Ingredients</p>
                            <p className="text-3xl font-black text-stone-900">48</p>
                        </div>
                    </div>

                    <div className="pt-2">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-orange-600" />
                                <span className="text-[11px] font-black uppercase tracking-widest text-stone-600">Weekly Activity</span>
                            </div>
                        </div>
                        <div className="flex items-end justify-between h-16 gap-2 px-1">
                            {[40, 70, 45, 90, 65, 30, 85].map((height, i) => (
                                <div 
                                    key={i} 
                                    className="w-full bg-stone-200 rounded-t-md hover:bg-orange-500 transition-all duration-300 cursor-pointer shadow-sm" 
                                    style={{ height: `${height}%` }}
                                />
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>
          </div>
        </div>

        {/* 3. FULL WIDTH SECTION: BROWSE CATEGORIES */}
        <section className="space-y-6 w-full">
          <div className="flex items-center gap-3 px-2">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Utensils className="w-5 h-5 text-orange-600" />
            </div>
            <h3 className="text-2xl font-black text-stone-900 tracking-tight">Browse Categories</h3>
          </div>
          <Card className="border-none shadow-md bg-white rounded-[2.5rem] p-8">
            <div className="flex flex-wrap gap-4 justify-start">
              {categories.map((category) => (
                /* FIXED LINK: Matches /recipes/category/[category] */
                <Link 
                  key={category.strCategory} 
                  href={`/recipes/category/${category.strCategory.toLowerCase()}`}
                  className="group"
                >
                  <Badge 
                    variant="secondary" 
                    className="bg-stone-50 text-stone-800 border-stone-100 hover:bg-orange-600 hover:text-white hover:border-orange-600 transition-all duration-300 cursor-pointer font-bold px-5 py-3 flex items-center gap-3 rounded-2xl shadow-sm"
                  >
                    <span className="text-2xl">{getCategoryEmoji(category.strCategory)}</span>
                    <span className="text-sm tracking-tight">{category.strCategory}</span>
                  </Badge>
                </Link>
              ))}
            </div>
          </Card>
        </section>

        {/* 4. FULL WIDTH SECTION: GLOBAL CUISINES */}
        <section className="space-y-6 w-full">
          <div className="flex items-center gap-3 px-2">
            <div className="p-2 bg-orange-100 rounded-lg">
              <MapPin className="w-5 h-5 text-orange-600" />
            </div>
            <h3 className="text-2xl font-black text-stone-900 tracking-tight">Explore Global Cuisines</h3>
          </div>
          <Card className="border-none shadow-md bg-white rounded-[2.5rem] p-8">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-6">
              {areas.map((area) => (
                /* FIXED LINK: Matches /recipes/cuisine/[cuisine] */
                <Link 
                  key={area.strArea}
                  href={`/recipes/cuisine/${area.strArea.toLowerCase()}`}
                  className="group"
                >
                  <div className="flex flex-col items-center justify-center p-4 rounded-3xl hover:bg-orange-50/50 transition-all duration-300 border border-transparent hover:border-orange-100">
                    <span className="text-4xl mb-3 transition-transform duration-300 group-hover:scale-110 block">
                      {getCountryFlag(area.strArea)}
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-stone-500 group-hover:text-orange-600 transition-colors text-center">
                      {area.strArea}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </Card>
        </section>

        {/* 5. BOTTOM SECTION: STATS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="p-10 border-stone-200 shadow-sm border-dashed border-2 flex flex-col items-center justify-center text-center bg-white/50 rounded-[2rem]">
                <History className="w-8 h-8 text-stone-300 mb-3" />
                <p className="text-stone-500 font-bold uppercase tracking-[0.2em] text-xs">Cooking History Empty</p>
            </Card>
            <Card className="p-10 border-stone-200 shadow-sm border-dashed border-2 flex flex-col items-center justify-center text-center bg-white/50 rounded-[2rem]">
                <Heart className="w-8 h-8 text-stone-300 mb-3" />
                <p className="text-stone-500 font-bold uppercase tracking-[0.2em] text-xs">0 Recipes Saved</p>
            </Card>
        </div>

      </div>
    </div>
  );
}

export default DashboardPage;