import { auth, currentUser } from '@clerk/nextjs/server';
import React from 'react'

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN;

const checkUser = async() => {
    const user = await currentUser();
    if(!user){
        return null;
    }
 
    if(!STRAPI_API_TOKEN){
        console.warn('STRAPI_API_TOKEN is not defined; admin operations will be skipped.');
    }

    const {has} = await auth();
    const subscriptionTier = has({plan: "pro"}) ? "pro" : "free";

    try {
        // 1. Try to find the user in Strapi by their Clerk ID
        let existingUserResponse = null;
        if (STRAPI_API_TOKEN) {
            try {
                // The users endpoint is flat, we filter directly
                existingUserResponse = await fetch(`${STRAPI_URL}/api/users?filters[clerkId][$eq]=${user.id}`, {
                    headers: {
                        Authorization: `Bearer ${STRAPI_API_TOKEN}`,
                    },
                    cache: 'no-store',
                });

                if (!existingUserResponse.ok) {
                    existingUserResponse = null;
                }
            } catch (err) {
                existingUserResponse = null;
            }
        }

        const dataArr = existingUserResponse ? await existingUserResponse.json() : [];
        
        // 2. If user exists, update tier if it changed
        if (Array.isArray(dataArr) && dataArr.length > 0) {
            const existingUser = dataArr[0];

            if (existingUser.subscriptionTier !== subscriptionTier) {
                const updateUserResponse = await fetch(`${STRAPI_URL}/api/users/${existingUser.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${STRAPI_API_TOKEN}`,
                    },
                    // /api/users updates must be FLAT, no "data" wrapper
                    body: JSON.stringify({
                        subscriptionTier,
                    }),
                });

                if (updateUserResponse.ok) {
                    return await updateUserResponse.json();
                }
            }
            return existingUser;
        }

        // 3. User doesn't exist, let's prepare to create them
        const email = user.emailAddresses?.[0]?.emailAddress;
        const username = user.username || email || `user_${user.id}`;
        const password = 'clerk_managed_user_pwd_123!';

        // Attempt to find the "Authenticated" role ID
        let roleId = 1; // Default fallback to 1 (usually Authenticated in Strapi)
        try {
            const rolesRes = await fetch(`${STRAPI_URL}/api/users-permissions/roles`, {
                headers: { Authorization: `Bearer ${STRAPI_API_TOKEN}` },
                cache: 'no-store',
            });
            if (rolesRes.ok) {
                const rolesData = await rolesRes.json();
                const rolesList = rolesData.roles || [];
                const found = rolesList.find(r => r.type === 'authenticated' || r.name.toLowerCase() === 'authenticated');
                if (found) roleId = found.id;
            }
        } catch (err) {
            console.warn("Could not fetch roles, using default ID 1");
        }

        // 4. Create the user using the Admin API (/api/users)
        // This is the most reliable way to set clerkId and role at once
        const createUserResponse = await fetch(`${STRAPI_URL}/api/users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${STRAPI_API_TOKEN}`,
            },
            // /api/users expects a FLAT object, NOT wrapped in "data"
            body: JSON.stringify({
                username,
                email,
                password,
                confirmed: true,
                role: roleId,
                clerkId: user.id,
                fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
                subscriptionTier,
            }),
        });

        if (!createUserResponse.ok) {
            const errorData = await createUserResponse.text();
            // If creation fails (e.g. user already exists by email), try one last lookup
            if (createUserResponse.status === 400) {
                const retryLookup = await fetch(`${STRAPI_URL}/api/users?filters[email][$eq]=${email}`, {
                    headers: { Authorization: `Bearer ${STRAPI_API_TOKEN}` },
                });
                if (retryLookup.ok) {
                    const retryData = await retryLookup.json();
                    if (retryData.length > 0) return retryData[0];
                }
            }
            throw new Error(`Failed to create user in Strapi: ${createUserResponse.status} - ${errorData}`);
        }

        return await createUserResponse.json();

    } catch (error) {
        console.error("Error in checkUser:", error);
        return null;
    }
}

export default checkUser;