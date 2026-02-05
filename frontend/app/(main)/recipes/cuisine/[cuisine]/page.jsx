"use client";

import { getMealsByArea } from '@/actions/mealdb.actions';
import RecipeGrid from '@/components/RecipeGrid';
import { useParams } from 'next/navigation';
import React from 'react';

const CuisineRecipesPage = () => {
    const params = useParams();
   
    const cuisineValue = params.cuisine;

    return (
        <RecipeGrid
            type="cuisine"
            value={cuisineValue}
            fetchAction={getMealsByArea}
            backLink="/dashboard"
        />
    );
};

export default CuisineRecipesPage;