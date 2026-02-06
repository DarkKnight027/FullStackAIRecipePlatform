"use server";

import checkUser from "@/lib/checkUser"; // Corrected default import
import { GoogleGenerativeAI } from "@google/generative-ai";
import { freePantryScans, proTierLimit } from "@/lib/arcjet";
import { request } from "@arcjet/next";
import { revalidatePath } from "next/cache";

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

/**
 * SCAN PANTRY IMAGE
 */
export async function scanPantryImage(formData) {
  try {
    const user = await checkUser();
    if (!user) throw new Error("User not authenticated");

    const isPro = user.subscriptionTier === "pro";
    const arcjetClient = isPro ? proTierLimit : freePantryScans;
    const req = await request();

    const decision = await arcjetClient.protect(req, {
      userId: user.clerkId,
      requested: 1,
    });

    if (decision.isDenied()) {
      throw new Error(isPro ? "Scan limit reached." : "Upgrade to Pro for more scans!");
    }

    const imageFile = formData.get("image");
    if (!imageFile) throw new Error("No image provided");

    const bytes = await imageFile.arrayBuffer();
    const base64Image = Buffer.from(bytes).toString("base64");

    // FIXED: Using stable gemini-1.5-flash
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Identify food ingredients in this image. Return ONLY a valid JSON array: [{"name": "item name", "quantity": "estimated amount", "confidence": 0.95}]`;

    const result = await model.generateContent([
      prompt,
      { inlineData: { mimeType: imageFile.type, data: base64Image } },
    ]);

    const response = await result.response;
    const text = response.text();

    // Robust JSON cleaning
    const cleanText = text.replace(/```json|```/gi, "").trim();
    const ingredients = JSON.parse(cleanText);

    return {
      success: true,
      ingredients: ingredients.slice(0, 20),
      message: `Found ${ingredients.length} ingredients!`,
    };
  } catch (error) {
    console.error("Scan error:", error);
    throw new Error(error.message || "Failed to scan image");
  }
}

/**
 * SAVE BULK INGREDIENTS
 */
export async function saveToPantry(formData) {
  try {
    const user = await checkUser();
    if (!user) throw new Error("User not authenticated");

    const ingredients = JSON.parse(formData.get("ingredients"));
    if (!ingredients?.length) throw new Error("No items to save");

    const savedItems = [];
    for (const item of ingredients) {
      const response = await fetch(`${STRAPI_URL}/api/pantry-items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${STRAPI_API_TOKEN}`,
        },
        body: JSON.stringify({
          data: { name: item.name, quantity: item.quantity, owner: user.id },
        }),
      });

      if (response.ok) savedItems.push(await response.json());
    }

    revalidatePath("/pantry");
    return { success: true, message: `Saved ${savedItems.length} items!` };
  } catch (error) {
    throw new Error(error.message || "Failed to save items");
  }
}

/**
 * ADD SINGLE ITEM MANUALLY
 */
export async function addPantryItemManually(formData) {
  try {
    const user = await checkUser();
    if (!user) throw new Error("User not authenticated");

    const name = formData.get("name");
    const quantity = formData.get("quantity");

    const response = await fetch(`${STRAPI_URL}/api/pantry-items`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${STRAPI_API_TOKEN}`,
      },
      body: JSON.stringify({
        data: { name: name.trim(), quantity: quantity.trim(), owner: user.id },
      }),
    });

    if (!response.ok) throw new Error("Failed to add item to Strapi");

    revalidatePath("/pantry");
    return { success: true };
  } catch (error) {
    throw new Error(error.message);
  }
}

/**
 * GET ALL ITEMS (Corrected for Map UI)
 */
export async function getPantryItems() {
  try {
    const user = await checkUser();
    if (!user) throw new Error("User not authenticated");

    const response = await fetch(
      `${STRAPI_URL}/api/pantry-items?filters[owner][id][$eq]=${user.id}&sort=createdAt:desc`,
      {
        headers: { Authorization: `Bearer ${STRAPI_API_TOKEN}` },
        cache: "no-store",
      }
    );

    const data = await response.json();

    // FLATTENING: Mapping Strapi structure to flat objects for items.map()
    const items = (data.data || []).map(item => ({
      id: item.id,
      name: item.attributes?.name || item.name,
      quantity: item.attributes?.quantity || item.quantity,
    }));

    return items; // Return array directly so items.map() works
  } catch (error) {
    console.error("Fetch error:", error);
    return []; // Return empty array to prevent UI crash
  }
}

/**
 * DELETE ITEM
 */
export async function deletePantryItem(itemId) {
  try {
    const user = await checkUser();
    if (!user) throw new Error("Unauthorized");

    const response = await fetch(`${STRAPI_URL}/api/pantry-items/${itemId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${STRAPI_API_TOKEN}` },
    });

    if (!response.ok) throw new Error("Delete failed");

    revalidatePath("/pantry");
    return { success: true };
  } catch (error) {
    throw new Error(error.message);
  }
}

/**
 * UPDATE ITEM
 */
export async function updatePantryItem(itemId, formData) {
  try {
    const user = await checkUser();
    if (!user) throw new Error("Unauthorized");

    const response = await fetch(`${STRAPI_URL}/api/pantry-items/${itemId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${STRAPI_API_TOKEN}`,
      },
      body: JSON.stringify({
        data: {
          name: formData.get("name"),
          quantity: formData.get("quantity"),
        },
      }),
    });

    revalidatePath("/pantry");
    return { success: true };
  } catch (error) {
    throw new Error(error.message);
  }
}