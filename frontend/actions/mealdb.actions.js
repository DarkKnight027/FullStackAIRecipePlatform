"use server";

const MEALDB_BASE = 'https://www.themealdb.com/api/json/v1/1';

export async function getRecipeOfTheDay() {

    try{
        const res = await fetch(`${MEALDB_BASE}/random.php`, {
            next: { revalidate: 86400 }, // Revalidate every 24 hours
        });

        if(!res.ok){
            throw new Error('Failed to fetch Recipe of the Day');
        }
        const data =  await res.json();
        return {
            success : true,
            recipe: data.meals[0],
        }   ;
    } catch(error){
        console.error('Error fetching Recipe of the Day:', error);
        throw new Error('Error fetching Recipe of the Day');
    }

}
    


export async function getCategories() {
     try{
        const res = await fetch(`${MEALDB_BASE}/list.php?c=list`, {
            next: { revalidate: 604800 }, // Revalidate every 1 week
        });

        if(!res.ok){
            throw new Error('Failed to fetch categories');
        }
        const data =  await res.json();
        return {
            success : true,
            categories: data.meals || [],
        }   ;
    } catch(error){
        console.error('Error fetching categories:', error);
        throw new Error('Error fetching categories');
    }
}

export async function getAreas() {

    try{
        const res = await fetch(`${MEALDB_BASE}/list.php?a=list`, {
             next: { revalidate: 86400 }, // Revalidate every 24 hours
        });

        if(!res.ok){
            throw new Error('Failed to fetch areas');
        }
        const data =  await res.json();
        return {
            success : true,
            areas: data.meals || [],
        }   ;
    } catch(error){
        console.error('Error fetching areas:', error);
        throw new Error('Error fetching areas');
    }
}

export async function getMealsByCategory(category) {
    try{
        const res = await fetch(`${MEALDB_BASE}/filter.php?c=${category}`, {
            next: { revalidate: 86400 }, // Revalidate every 24 hours
        });

        if(!res.ok){
            throw new Error('Failed to fetch meals by category');
        }
        const data =  await res.json();
        return {
            success : true,
            meals: data.meals || [],
        }   ;
    } catch(error){
        console.error('Error fetching meals by category:', error);
        throw new Error('Error fetching meals by category');
    }           
}

export async function getMealsByArea(area) {
    try{
        const res = await fetch(`${MEALDB_BASE}/filter.php?a=${area}`, {
            next: { revalidate: 86400 }, // Revalidate every 24 hours
        });

        if(!res.ok){
            throw new Error('Failed to fetch meals by area');
        }
        const data =  await res.json();
        return {
            success : true,
            meals: data.meals || [],
        }   ;
    } catch(error){
        console.error('Error fetching meals by area:', error);
        throw new Error('Error fetching meals by area');
    }
}