"use client";

import { getMealsByCategory } from '@/actions/mealdb.actions';
import RecipeGrid from '@/components/RecipeGrid';
import { useParams } from 'next/navigation';
import React from 'react';

const CategoryRecipesPage = () => {
    const params = useParams();
    const categoryName = params.category; // matches [category] folder name

    return (
        <RecipeGrid
            type="category"
            value={categoryName}
            fetchAction={getMealsByCategory}
            backLink="/dashboard"
        />
    );
};

export default CategoryRecipesPage;