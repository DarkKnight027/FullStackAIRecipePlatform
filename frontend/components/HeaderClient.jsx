"use client";

import { SignedOut, SignedIn, SignInButton, SignUpButton } from '@clerk/nextjs';
import React from 'react';
import { Button } from './ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { Cookie, Refrigerator, Sparkles } from 'lucide-react';
import UserDropdown from './UserDropdown';
import PricingModal from './PricingModal';
import { Badge } from './ui/badge';

export default function HeaderClient({ user }) {
  const tier = user?.subscriptionTier === "pro" ? "pro" : "free";

  return (
    <header className="fixed top-0 w-full border-b border-stone-200 bg-white/95 backdrop-blur-md z-50">
      <nav className="max-w-7xl mx-auto px-4 h-16 grid grid-cols-3 items-center">
        
        {/* LEFT: Logo */}
        <div className="flex justify-start">
          <Link href={user ? "/dashboard" : "/"} className="flex items-center group">
            <div className="relative">
                 <Image 
                    src="/logo.png" 
                    alt="Swadistt Logo" 
                    width={48} 
                    height={48} 
                    className="w-10 h-10 sm:w-11 sm:h-11 object-contain transition-transform group-hover:scale-110" 
                />
            </div>
            {/* Standardized to orange-600 */}
            <span className="text-orange-600 font-extrabold text-xl ml-2 hidden sm:block tracking-tight">
                Swadistt
            </span>
          </Link>
        </div>

        {/* CENTER: Navigation Links */}
        <div className="flex justify-center items-center gap-1 sm:gap-4">
          <Link 
            href="/recipes" 
            className="flex items-center gap-1.5 text-stone-500 hover:text-orange-600 px-3 py-2 transition-colors font-semibold text-sm rounded-lg hover:bg-orange-50"
          >
            <Cookie className="w-4 h-4" /> 
            <span className="inline">My Recipes</span>
          </Link>
          <Link 
            href="/pantry" 
            className="flex items-center gap-1.5 text-stone-500 hover:text-orange-600 px-3 py-2 transition-colors font-semibold text-sm rounded-lg hover:bg-orange-50"
          >
            <Refrigerator className="w-4 h-4" /> 
            <span className="inline">My Pantry</span>
          </Link>
        </div>

        {/* RIGHT: User Actions */}
        <div className="flex justify-end items-center space-x-3">
          <SignedIn>
            <div className="flex items-center space-x-3">
              <PricingModal subscriptionTier={tier}>
                <Badge 
                  variant='outline' 
                  className={`flex h-8 px-3 gap-1.5 rounded-full text-[10px] sm:text-xs font-bold transition-all cursor-pointer border-2 ${
                    tier === "pro" 
                      ? "bg-orange-600 border-orange-700 text-white shadow-md shadow-orange-100 hover:bg-orange-700" 
                      : "bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100"
                  }`}
                >
                  <Sparkles className={`h-3 w-3 ${tier === "pro" ? "fill-white" : "text-stone-400"}`} />
                  <span>{tier === "pro" ? "Pro Chef" : "Upgrade"}</span>
                </Badge>
              </PricingModal>
              <UserDropdown />
            </div>
          </SignedIn>

          <SignedOut>
            <div className="flex items-center space-x-2">
              <SignInButton mode="modal">
                <Button variant="ghost" size="sm" className="text-stone-600 hover:text-orange-600 font-bold">
                    Sign In
                </Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button size="sm" className="bg-orange-600 hover:bg-orange-700 text-white rounded-full px-5 sm:px-7 font-bold shadow-lg shadow-orange-100 transition-transform active:scale-95">
                  Get Started
                </Button>
              </SignUpButton>
            </div>
          </SignedOut>
        </div>
      </nav>
    </header>
  );
}