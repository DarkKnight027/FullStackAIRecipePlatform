import { auth, currentUser } from "@clerk/nextjs/server";

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN;

export const checkUser = async () => {
  const user = await currentUser();

  if (!user) {
    return null;
  }

  if (!STRAPI_API_TOKEN) {
    console.error("❌ STRAPI_API_TOKEN is missing in .env.local");
    return null;
  }

  const { has } = await auth();
  const subscriptionTier = has({ plan: "pro" }) ? "pro" : "free";
  const userEmail = user.emailAddresses[0].emailAddress;

  try {
    // 1. Search for user by clerkId OR Email to prevent "Email already taken"
    // Note: /api/users (the User-Permissions plugin) uses direct query params, not always [filters]
    const existingUserResponse = await fetch(
      `${STRAPI_URL}/api/users?filters[clerkId][$eq]=${user.id}&filters[email][$eq]=${userEmail}`,
      {
        headers: { Authorization: `Bearer ${STRAPI_API_TOKEN}` },
        cache: "no-store",
      }
    );

    if (!existingUserResponse.ok) {
      const errorText = await existingUserResponse.text();
      console.error("Strapi search error:", errorText);
      return null;
    }

    const existingUserData = await existingUserResponse.json();

    // 2. If user exists, update and return
    if (existingUserData && existingUserData.length > 0) {
      const existingUser = existingUserData[0];

      if (existingUser.subscriptionTier !== subscriptionTier) {
        await fetch(`${STRAPI_URL}/api/users/${existingUser.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${STRAPI_API_TOKEN}`,
          },
          body: JSON.stringify({ subscriptionTier }),
        });
      }

      return { ...existingUser, subscriptionTier };
    }

    // 3. Fallback: Double check by email specifically before creating
    // This handles cases where clerkId is missing but the email exists
    const emailCheckRes = await fetch(
      `${STRAPI_URL}/api/users?filters[email][$eq]=${userEmail}`,
      {
        headers: { Authorization: `Bearer ${STRAPI_API_TOKEN}` },
        cache: "no-store",
      }
    );
    const emailCheckData = await emailCheckRes.json();
    
    if (emailCheckData.length > 0) {
        // User exists by email, but didn't have the clerkId. Let's link them.
        const foundUser = emailCheckData[0];
        const linkRes = await fetch(`${STRAPI_URL}/api/users/${foundUser.id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${STRAPI_API_TOKEN}`,
            },
            body: JSON.stringify({ clerkId: user.id, subscriptionTier }),
        });
        return await linkRes.json();
    }

    // 4. Get authenticated role for NEW user
    const rolesResponse = await fetch(`${STRAPI_URL}/api/users-permissions/roles`, {
      headers: { Authorization: `Bearer ${STRAPI_API_TOKEN}` },
    });
    const rolesData = await rolesResponse.json();
    const authenticatedRole = rolesData.roles.find(r => r.type === "authenticated");

    // 5. Create new user
    const userData = {
      username: user.username || userEmail.split("@")[0] + "_" + Math.random().toString(36).slice(-4),
      email: userEmail,
      password: `clerk_managed_${user.id}_${Date.now()}`,
      confirmed: true,
      role: authenticatedRole?.id,
      clerkId: user.id,
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      imageUrl: user.imageUrl || "",
      subscriptionTier,
    };

    const newUserResponse = await fetch(`${STRAPI_URL}/api/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${STRAPI_API_TOKEN}`,
      },
      body: JSON.stringify(userData),
    });

    if (!newUserResponse.ok) {
      const errorData = await newUserResponse.json();
      console.error("❌ Critical Error Creating User:", errorData);
      return null;
    }

    return await newUserResponse.json();
  } catch (error) {
    console.error("❌ Error in checkUser:", error);
    return null;
  }
};