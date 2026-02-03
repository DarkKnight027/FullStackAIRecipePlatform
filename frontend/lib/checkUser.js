import { currentUser } from '@clerk/nextjs/dist/types/server';
import React from 'react'


const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";

const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN;

const checkUser = async() => {
    const user = await currentUser();
    if(!user){
        return null;
    }
 
    if(!STRAPI_API_TOKEN){
        throw new Error("STRAPI_API_TOKEN is not defined");
        return null;
    }

   const subscriptionTier = "free";

   try{
    const existingUserResponse = await fetch(`${STRAPI_URL}/api/users?filters[clerkId][$eq]=${user.id}&populate=*&publicationState=live`,{
        headers:{
            Authorization: `Bearer ${STRAPI_API_TOKEN}`,
        },
        cache: 'no-store',
    });

    if(!existingUserResponse.ok){
        const errorData = await existingUserResponse.text();
        throw new Error(`Failed to fetch user from Strapi: ${existingUserResponse.status} - ${errorData}`);
        return null;
    }
    const existingUserData = await existingUserResponse.json();

    if(existingUserData.data.length > 0){   
        const existingUser = existingUserData.data[0];

        if(existingUser.subscriptionTier!==subscriptionTier){
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
                return null;
            }

            const updatedUserData = await updateUserResponse.json();
            return updatedUserData.data;
        }

        return existingUser;
    } else {
        const createUserResponse = await fetch(`${STRAPI_URL}/api/users`,{
            method: 'POST',
            headers:{
                'Content-Type': 'application/json',
                Authorization: `Bearer ${STRAPI_API_TOKEN}`,
            },
            body: JSON.stringify({
                data:{
                    clerkId: user.id,
                    email: user.emailAddresses[0].emailAddress,
                    fullName: user.fullName,
                    subscriptionTier,
                },
            }),
        });

        if(!createUserResponse.ok){
            const errorData = await createUserResponse.text();
            throw new Error(`Failed to create user in Strapi: ${createUserResponse.status} - ${errorData}`);
            return null;
        }

        const newUserData = await createUserResponse.json();
        return newUserData.data;
    }
   } catch (error) {
        console.error("Error in checkUser:", error);
        return null;
   }
}

export default checkUser