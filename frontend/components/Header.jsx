"use client";

import { SignedOut, SignedIn, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs'
import React from 'react'
import { Button } from './ui/button';
import Image from 'next/image';
import Link from 'next/link';

const Header = () => {
  const user = null; //replace with actual user logic
  return (
    <header className='fixed top-0 w-full border-b border-stone-200 bg-stone-50/80 backdrop-blur-md z-50 supports-backdrop-blur-md
    '>  
    <nav className='containter mx-auto px-4 h-16 flex items-center justify-between    '>
        <Link href={user ? "/dashboard" : "/"}>
          <Image src="/logo2.png" alt="Logo" width={60} height={60} className="w-16" />
        </Link>

        <div>
            Nav Links
        </div>
        <div className='flex items-center space-x-4'>

                 <SignedIn>
              <UserButton />
            </SignedIn>
         <SignedOut>
              <SignInButton  mode="modal">
                <Button variant="ghost" className='text-stone-600 hover:text-orange-600 hover:bg-orange-50 font-medium'>Sign In</Button>
              </SignInButton>
              <SignUpButton mode="modal">
                    <Button variant="primary" className='rounded-full px-6'>Get Started</Button>
              </SignUpButton>
            </SignedOut>
       
            </div>
            </nav>
    </header>
  )
}

export default Header