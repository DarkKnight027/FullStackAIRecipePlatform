"use server";
const { GoogleGenerativeAI } = require("@google/generative-ai");

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN;

const Gemini_API_KEY = process.env.GEMINI_API_KEY;


const genAI = new GoogleGenerativeAI();