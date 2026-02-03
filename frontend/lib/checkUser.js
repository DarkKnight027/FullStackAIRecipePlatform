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
        console.warn('STRAPI_API_TOKEN is not defined; admin operations will be skipped. Public registration and lookups will be used where possible.');
    }

        const {has} = await auth();
   const subscriptionTier = has({plan: "pro"}) ? "pro" : "free" ;

   try{
    // Try admin lookup first (if token present), otherwise fall back to public lookup
    let existingUserResponse;
    if (STRAPI_API_TOKEN) {
        try {
            existingUserResponse = await fetch(`${STRAPI_URL}/api/users?filters[clerkId][$eq]=${user.id}&populate=*&publicationState=live`,{
                headers:{
                    Authorization: `Bearer ${STRAPI_API_TOKEN}`,
                },
                cache: 'no-store',
            });

            if (!existingUserResponse.ok && (existingUserResponse.status === 401 || existingUserResponse.status === 403)) {
                const errText = await existingUserResponse.text();
                console.warn(`Warning: admin lookup failed (${existingUserResponse.status}): ${errText}`);
                existingUserResponse = null; // trigger fallback to public lookup
            }
        } catch (err) {
            console.warn('Warning: admin lookup error', err);
            existingUserResponse = null;
        }
    }

    if (!existingUserResponse) {
        // Public lookup (no token) - may return limited info depending on Strapi config
        try {
            existingUserResponse = await fetch(`${STRAPI_URL}/api/users?filters[clerkId][$eq]=${user.id}&populate=*&publicationState=live`, { cache: 'no-store' });
            if (!existingUserResponse.ok) {
                const errText = await existingUserResponse.text();
                console.warn(`Warning: public lookup failed (${existingUserResponse.status}): ${errText}`);
                // continue, we'll handle as no existing user
                existingUserResponse = null;
            }
        } catch (err) {
            console.warn('Warning: public lookup error', err);
            existingUserResponse = null;
        }
    }

    const existingUserData = existingUserResponse ? await existingUserResponse.json() : null;
    const dataArr = Array.isArray(existingUserData?.data) ? existingUserData.data : [];

    if (dataArr.length > 0) {
        const first = dataArr[0];
        const existingUser = { id: first.id, ...(first.attributes || {}) };

        if (existingUser.subscriptionTier !== subscriptionTier) {
            const updateUserResponse = await fetch(`${STRAPI_URL}/api/users/${existingUser.id}`,{
                method: 'PUT',
                headers:{
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${STRAPI_API_TOKEN}`,
                },
                body: JSON.stringify({
                    data:{
                        subscriptionTier,
                    },
                }),
            });

            if(!updateUserResponse.ok){
                const errorData = await updateUserResponse.text();
                throw new Error(`Failed to update user in Strapi: ${updateUserResponse.status} - ${errorData}`);
            }

            const updatedUserData = await updateUserResponse.json();
            const updated = updatedUserData?.data;
            if (updated) return { id: updated.id, ...(updated.attributes || {}) };
            return null;
        }

        return existingUser;
    } else {
        const email = user.emailAddresses?.[0]?.emailAddress;
        const username = user.username || email || `user_${user.id}`;
        const password = 'clerk_managed_user';

        // First try public registration (no admin token required)
        try {
            const registerRes = await fetch(`${STRAPI_URL}/api/auth/local/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password }),
            });

            if (registerRes.ok) {
                const regJson = await registerRes.json();
                // Strapi may return { user } or { data } shapes; normalize
                const createdRaw = regJson.user ?? regJson.data ?? regJson;
                const createdId = createdRaw?.id ?? createdRaw?.user?.id ?? createdRaw?.data?.id;

                const created = createdRaw?.attributes ? { id: createdId, ...(createdRaw.attributes || {}) } : (createdRaw?.user ? { id: createdRaw.user.id, ...(createdRaw.user || {}) } : createdRaw);

                // If we have admin token, try to enrich the user with clerkId/fullName/subscriptionTier
                if (STRAPI_API_TOKEN && createdId) {
                    try {
                        const updateRes = await fetch(`${STRAPI_URL}/api/users/${createdId}`, {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json',
                                Authorization: `Bearer ${STRAPI_API_TOKEN}`,
                            },
                            body: JSON.stringify({ data: { clerkId: user.id, fullName: user.fullName, subscriptionTier } }),
                        });

                        if (updateRes.ok) {
                            const updatedJson = await updateRes.json();
                            const updatedRaw = updatedJson?.data ?? updatedJson;
                            return { id: updatedRaw.id, ...(updatedRaw.attributes || {}) };
                        } else {
                            console.warn('Warning: failed to enrich user via admin update after register', await updateRes.text());
                        }
                    } catch (err) {
                        console.warn('Warning: error enriching user after register', err);
                    }
                }

                return created;
            } else {
                const errText = await registerRes.text();
                console.warn(`Warning: public registration failed (${registerRes.status}): ${errText}`);

                // If it's because email/username already taken, try to find that existing user by email, username, or clerkId
                if (registerRes.status === 400 && errText && errText.includes('Email or Username are already taken')) {
                    try {
                        // Build OR filter to search by email, username, or clerkId
                        const orFilters = [];
                        if (email) orFilters.push(`filters[$or][0][email][$eq]=${encodeURIComponent(email)}`);
                        if (username) orFilters.push(`filters[$or][${orFilters.length}][username][$eq]=${encodeURIComponent(username)}`);
                        orFilters.push(`filters[$or][${orFilters.length}][clerkId][$eq]=${encodeURIComponent(user.id)}`);
                        const filterQuery = orFilters.join('&');

                        const findRes = await fetch(`${STRAPI_URL}/api/users?${filterQuery}&populate=*&publicationState=live`, { cache: 'no-store' });
                        if (findRes.ok) {
                            const foundJson = await findRes.json();
                            const dataArr = Array.isArray(foundJson?.data) ? foundJson.data : [];
                            if (dataArr.length > 0) {
                                const first = dataArr[0];
                                const existing = { id: first.id, ...(first.attributes || {}) };

                                // If we have admin token, try to set clerkId if missing
                                if (STRAPI_API_TOKEN && !existing.clerkId) {
                                    try {
                                        const enrichRes = await fetch(`${STRAPI_URL}/api/users/${existing.id}`, {
                                            method: 'PUT',
                                            headers: {
                                                'Content-Type': 'application/json',
                                                Authorization: `Bearer ${STRAPI_API_TOKEN}`,
                                            },
                                            body: JSON.stringify({ data: { clerkId: user.id, fullName: user.fullName, subscriptionTier } }),
                                        });

                                        if (enrichRes.ok) {
                                            const updatedJson = await enrichRes.json();
                                            const updatedRaw = updatedJson?.data ?? updatedJson;
                                            return { id: updatedRaw.id, ...(updatedRaw.attributes || {}) };
                                        } else {
                                            console.warn('Warning: failed to enrich existing user after duplicate registration', await enrichRes.text());
                                        }
                                    } catch (err) {
                                        console.warn('Warning: error enriching existing user after duplicate registration', err);
                                    }
                                }

                                return existing;
                            }
                        }
                    } catch (err) {
                        console.warn('Warning: error finding existing user after duplicate registration', err);
                    }
                }
            }
        } catch (err) {
            console.warn('Warning: error registering via public API', err);
        }

        // If public registration didn't work, fall back to admin creation (requires STRAPI_API_TOKEN)
        if (!STRAPI_API_TOKEN) {
            throw new Error('STRAPI_API_TOKEN is not set or lacks permissions to create users. Public registration failed and admin token is not available.');
        }

        // Attempt to find role ID via public users-permissions roles API first, then admin roles if available
        let roleId = null;
        try {
            const publicRolesRes = await fetch(`${STRAPI_URL}/api/users-permissions/roles`, {
                cache: 'no-store',
            });
            if (publicRolesRes.ok) {
                const rolesData = await publicRolesRes.json();
                const rolesList = Array.isArray(rolesData?.data) ? rolesData.data : (Array.isArray(rolesData) ? rolesData : []);
                const found = rolesList.find(r => (r?.code === 'authenticated') || (String(r?.name).toLowerCase() === 'authenticated'));
                roleId = found?.id ?? null;
            }
        } catch (err) {
            // ignore
        }

        if (!roleId) {
            // Try admin roles endpoint if public lookup failed
            try {
                const rolesRes = await fetch(`${STRAPI_URL}/admin/roles`, {
                    headers: {
                        Authorization: `Bearer ${STRAPI_API_TOKEN}`,
                    },
                    cache: 'no-store',
                });

                if (rolesRes.ok) {
                    const rolesData = await rolesRes.json();
                    const rolesList = Array.isArray(rolesData?.data) ? rolesData.data : [];
                    const found = rolesList.find(r => (r?.code === 'authenticated') || (String(r?.name).toLowerCase() === 'authenticated'));
                    roleId = found?.id ?? null;
                } else {
                    const errText = await rolesRes.text();
                    console.warn(`Warning: failed to fetch roles from Strapi (${rolesRes.status}): ${errText}`);
                }
            } catch (err) {
                console.warn('Warning: error fetching roles from Strapi', err);
            }
        }

        if (!roleId) {
            // Try to create the user via admin create WITHOUT a role (some Strapi setups default role automatically)
            if (STRAPI_API_TOKEN) {
                try {
                    const tryAdminCreateRes = await fetch(`${STRAPI_URL}/api/users`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${STRAPI_API_TOKEN}`,
                        },
                        body: JSON.stringify({
                            data: {
                                username,
                                email,
                                password,
                                confirmed: true,
                                clerkId: user.id,
                                fullName: user.fullName,
                                subscriptionTier,
                            },
                        }),
                    });

                    if (tryAdminCreateRes.ok) {
                        const createdJson = await tryAdminCreateRes.json();
                        const created = createdJson?.data;
                        if (created) return { id: created.id, ...(created.attributes || {}) };
                    } else {
                        const text = await tryAdminCreateRes.text();
                        console.warn(`Warning: admin create without role failed (${tryAdminCreateRes.status}): ${text}`);
                    }
                } catch (err) {
                    console.warn('Warning: error creating user via admin without role', err);
                }
            }

            // Last-chance: try public registration again (in case config changed) and look for an existing user
            try {
                const registerRes2 = await fetch(`${STRAPI_URL}/api/auth/local/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, email, password }),
                });

                if (registerRes2.ok) {
                    const regJson2 = await registerRes2.json();
                    const createdRaw2 = regJson2.user ?? regJson2.data ?? regJson2;
                    const createdId2 = createdRaw2?.id ?? createdRaw2?.user?.id ?? createdRaw2?.data?.id;
                    const created2 = createdRaw2?.attributes ? { id: createdId2, ...(createdRaw2.attributes || {}) } : (createdRaw2?.user ? { id: createdRaw2.user.id, ...(createdRaw2.user || {}) } : createdRaw2);
                    // try to enrich if possible
                    if (STRAPI_API_TOKEN && createdId2) {
                        try {
                            const updateRes2 = await fetch(`${STRAPI_URL}/api/users/${createdId2}`, {
                                method: 'PUT',
                                headers: {
                                    'Content-Type': 'application/json',
                                    Authorization: `Bearer ${STRAPI_API_TOKEN}`,
                                },
                                body: JSON.stringify({ data: { clerkId: user.id, fullName: user.fullName, subscriptionTier } }),
                            });

                            if (updateRes2.ok) {
                                const updatedJson2 = await updateRes2.json();
                                const updatedRaw2 = updatedJson2?.data ?? updatedJson2;
                                return { id: updatedRaw2.id, ...(updatedRaw2.attributes || {}) };
                            } else {
                                console.warn('Warning: failed to enrich after second register attempt', await updateRes2.text());
                            }
                        } catch (err) {
                            console.warn('Warning: error enriching after second register attempt', err);
                        }
                    }

                    return created2;
                }
            } catch (err) {
                console.warn('Warning: error registering via public API (retry)', err);
            }

            // Final fallback: try to find any existing user by email/username/clerkId
            try {
                const orFilters = [];
                if (email) orFilters.push(`filters[$or][0][email][$eq]=${encodeURIComponent(email)}`);
                if (username) orFilters.push(`filters[$or][${orFilters.length}][username][$eq]=${encodeURIComponent(username)}`);
                orFilters.push(`filters[$or][${orFilters.length}][clerkId][$eq]=${encodeURIComponent(user.id)}`);
                const filterQuery = orFilters.join('&');

                const findRes = await fetch(`${STRAPI_URL}/api/users?${filterQuery}&populate=*&publicationState=live`, { cache: 'no-store' });
                if (findRes.ok) {
                    const foundJson = await findRes.json();
                    const dataArr = Array.isArray(foundJson?.data) ? foundJson.data : [];
                    if (dataArr.length > 0) {
                        const first = dataArr[0];
                        const existing = { id: first.id, ...(first.attributes || {}) };

                        // Try to enrich with clerkId if we have a token
                        if (STRAPI_API_TOKEN && !existing.clerkId) {
                            try {
                                const enrichRes = await fetch(`${STRAPI_URL}/api/users/${existing.id}`, {
                                    method: 'PUT',
                                    headers: {
                                        'Content-Type': 'application/json',
                                        Authorization: `Bearer ${STRAPI_API_TOKEN}`,
                                    },
                                    body: JSON.stringify({ data: { clerkId: user.id, fullName: user.fullName, subscriptionTier } }),
                                });

                                if (enrichRes.ok) {
                                    const updatedJson = await enrichRes.json();
                                    const updatedRaw = updatedJson?.data ?? updatedJson;
                                    return { id: updatedRaw.id, ...(updatedRaw.attributes || {}) };
                                } else {
                                    console.warn('Warning: failed to enrich existing user during fallback', await enrichRes.text());
                                }
                            } catch (err) {
                                console.warn('Warning: error enriching existing user during fallback', err);
                            }
                        }

                        return existing;
                    }
                }
            } catch (err) {
                console.warn('Warning: error searching for existing user during final fallback', err);
            }

       
        }

        const createUserResponse = await fetch(`${STRAPI_URL}/api/users`,{
            method: 'POST',
            headers:{
                'Content-Type': 'application/json',
                Authorization: `Bearer ${STRAPI_API_TOKEN}`,
            },
            body: JSON.stringify({
                data:{
                    username,
                    email,
                    password,
                    confirmed: true,
                    role: roleId,
                    clerkId: user.id,
                    fullName: user.fullName,
                    subscriptionTier,
                },
            }),
        });

        if(!createUserResponse.ok){
            const errorData = await createUserResponse.text();
            throw new Error(`Failed to create user in Strapi: ${createUserResponse.status} - ${errorData}`);
        }

        const newUserData = await createUserResponse.json();
        const created = newUserData?.data;
        if (created) return { id: created.id, ...(created.attributes || {}) };
        return null;
    }
   } catch (error) {
        console.error("Error in checkUser:", error);
        return null;
   }
}

export default checkUser