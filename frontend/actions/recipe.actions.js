"use server";

import checkUser from "@/lib/checkUser";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { freeMealRecommendations, proTierLimit } from "@/lib/arcjet";
import { request } from "@arcjet/next";
import { revalidatePath } from "next/cache";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN;
const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Helper function to normalize recipe title
function normalizeTitle(title) {
  return title
    .trim()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

// Helper function to fetch image from Unsplash
async function fetchRecipeImage(recipeName) {
  try {
    if (!UNSPLASH_ACCESS_KEY) return "";
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(recipeName)}&per_page=1&orientation=landscape`,
      { headers: { Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}` } }
    );
    if (!response.ok) return "";
    const data = await response.json();
    return data.results?.[0]?.urls?.regular || "";
  } catch (error) {
    return "";
  }
}

// Get or generate recipe details
export async function getOrGenerateRecipe(formData) {
  try {
    const user = await checkUser();
    if (!user) throw new Error("User not authenticated");

    const recipeName = formData.get("recipeName");
    if (!recipeName) throw new Error("Recipe name is required");

    const normalizedTitle = normalizeTitle(recipeName);
    const isPro = user.subscriptionTier === "pro";

    // Step 1: Check DB
    const searchResponse = await fetch(
      `${STRAPI_URL}/api/recipes?filters[title][$eqi]=${encodeURIComponent(normalizedTitle)}&populate=*`,
      {
        headers: { Authorization: `Bearer ${STRAPI_API_TOKEN}` },
        cache: "no-store",
      }
    );

    if (searchResponse.ok) {
      const searchData = await searchResponse.json();
      if (searchData.data?.length > 0) {
        const dbRecipe = searchData.data[0];
        return {
          success: true,
          recipe: { id: dbRecipe.id, ...dbRecipe.attributes },
          recipeId: dbRecipe.id,
          fromDatabase: true,
          isPro,
        };
      }
    }

    // Step 2: Generate with Gemini
    // FIXED: Using stable gemini-1.5-flash
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `Generate a recipe for "${normalizedTitle}". Return ONLY a JSON object: {
      "title": "${normalizedTitle}",
      "description": "string",
      "category": "breakfast|lunch|dinner|snack|dessert",
      "cuisine": "string",
      "prepTime": number,
      "cookTime": number,
      "servings": number,
      "ingredients": [{"item": "name", "amount": "qty", "category": "type"}],
      "instructions": [{"step": number, "title": "string", "instruction": "string"}],
      "nutrition": {"calories": "qty", "protein": "qty", "carbs": "qty", "fat": "qty"},
      "tips": ["string"],
      "substitutions": [{"original": "name", "alternatives": ["names"]}]
    }`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().replace(/```json|```/gi, "").trim();
    const recipeData = JSON.parse(text);

    // Step 3: Fetch image
    const imageUrl = await fetchRecipeImage(normalizedTitle);

    // Step 4: Save to Strapi
    const createRes = await fetch(`${STRAPI_URL}/api/recipes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${STRAPI_API_TOKEN}`,
      },
      body: JSON.stringify({
        data: { ...recipeData, title: normalizedTitle, imageUrl, author: user.id, isPublic: true },
      }),
    });

    const newRecipe = await createRes.json();
    revalidatePath("/recipes");

    return {
      success: true,
      recipe: { id: newRecipe.data.id, ...newRecipe.data.attributes },
      recipeId: newRecipe.data.id,
      fromDatabase: false,
      isPro,
    };
  } catch (error) {
    console.error("Recipe Error:", error);
    throw new Error("Failed to load recipe");
  }
}

// Get recipes based on pantry ingredients
export async function getRecipesByPantryIngredients() {
  try {
    const user = await checkUser();
    if (!user) throw new Error("Unauthorized");

    const isPro = user.subscriptionTier === "pro";
    const arcjetClient = isPro ? proTierLimit : freeMealRecommendations;
    const req = await request();
    const decision = await arcjetClient.protect(req, { userId: user.clerkId, requested: 1 });

    if (decision.isDenied()) throw new Error("Rate limit reached");

    const pantryRes = await fetch(`${STRAPI_URL}/api/pantry-items?filters[owner][id][$eq]=${user.id}`, {
      headers: { Authorization: `Bearer ${STRAPI_API_TOKEN}` },
      cache: "no-store",
    });

    const pantryData = await pantryRes.json();
    if (!pantryData.data?.length) return { success: false, message: "Pantry is empty!" };

    const ingredients = pantryData.data.map(i => i.attributes.name).join(", ");
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Suggest 5 recipes using: ${ingredients}. Return ONLY JSON array: [{"title": "name", "description": "text", "matchPercentage": number, "missingIngredients": []}]`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().replace(/```json|```/gi, "").trim();
    
    return {
      success: true,
      recipes: JSON.parse(text),
      isPro
    };
  } catch (error) {
    throw new Error(error.message);
  }
}

// Save recipe to collection
export async function saveRecipeToCollection(formData) {
  try {
    const user = await checkUser();
    const recipeId = formData.get("recipeId");

    const response = await fetch(`${STRAPI_URL}/api/saved-recipes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${STRAPI_API_TOKEN}`,
      },
      body: JSON.stringify({
        data: { user: user.id, recipe: recipeId, savedAt: new Date().toISOString() },
      }),
    });

    revalidatePath("/saved");
    return { success: true };
  } catch (error) {
    throw new Error("Failed to save");
  }
}

// Get user's saved recipes
export async function getSavedRecipes() {
  try {
    const user = await checkUser();
    if (!user) throw new Error("Unauthorized");

    const res = await fetch(
      `${STRAPI_URL}/api/saved-recipes?filters[user][id][$eq]=${user.id}&populate[recipe][populate]=*&sort=savedAt:desc`,
      { headers: { Authorization: `Bearer ${STRAPI_API_TOKEN}` }, cache: "no-store" }
    );

    const data = await res.json();
    const recipes = data.data.map(item => ({
      id: item.recipe.id,
      ...item.recipe.attributes
    }));

    return { success: true, recipes };
  } catch (error) {
    return { success: false, recipes: [] };
  }
}