import { auth, currentUser } from '@clerk/nextjs/server';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN;

const checkUser = async () => {
    const user = await currentUser();
    if (!user) {
        return null;
    }

    if (!STRAPI_API_TOKEN) {
        console.warn('STRAPI_API_TOKEN is not defined; admin operations will be skipped.');
    }

    const { has } = await auth();
    const subscriptionTier = has({ plan: "pro" }) ? "pro" : "free";

    try {
        // 1. Try to find the user in Strapi by their Clerk ID
        let existingUserResponse = null;
        if (STRAPI_API_TOKEN) {
            try {
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

        // 3. User doesn't exist, prepare to create
        const email = user.emailAddresses?.[0]?.emailAddress;
        const username = user.username || email || `user_${user.id}`;
        const password = 'clerk_managed_user_pwd_123!';

        let roleId = 1; 
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

        // 4. Create the user
        const createUserResponse = await fetch(`${STRAPI_URL}/api/users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${STRAPI_API_TOKEN}`,
            },
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
            if (createUserResponse.status === 400) {
                const retryLookup = await fetch(`${STRAPI_URL}/api/users?filters[email][$eq]=${email}`, {
                    headers: { Authorization: `Bearer ${STRAPI_API_TOKEN}` },
                });
                if (retryLookup.ok) {
                    const retryData = await retryLookup.json();
                    if (retryData.length > 0) return retryData[0];
                }
            }
            throw new Error(`Failed to create user in Strapi: ${createUserResponse.status}`);
        }

        return await createUserResponse.json();

    } catch (error) {
        console.error("Error in checkUser:", error);
        return null;
    }
}

export default checkUser;