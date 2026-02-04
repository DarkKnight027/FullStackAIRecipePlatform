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
    <header className="fixed top-0 w-full border-b border-stone-100 bg-white/95 backdrop-blur-md z-50">
      <nav className="max-w-7xl mx-auto px-4 h-16 grid grid-cols-3 items-center">
        
        {/* LEFT: Logo */}
        <div className="flex justify-start">
          <Link href={user ? "/dashboard" : "/"} className="flex items-center group">
            <Image 
                src="/logo.png" 
                alt="Swadistt Logo" 
                width={48} 
                height={48} 
                className="w-10 h-10 sm:w-12 sm:h-12 object-contain" 
            />
            <span className="text-orange-500 font-bold text-lg ml-2 hidden sm:block">
                Swadistt
            </span>
          </Link>
        </div>

        {/* CENTER: Navigation Links (Always Visible) */}
        <div className="flex justify-center items-center gap-2 sm:gap-6">
          <Link 
            href="/recipes" 
            className="flex items-center gap-1.5 text-stone-600 hover:text-orange-600 px-2 py-2 transition-all font-medium text-sm whitespace-nowrap"
          >
            <Cookie className="w-4 h-4" /> 
            <span className="inline">My Recipes</span>
          </Link>
          <Link 
            href="/pantry" 
            className="flex items-center gap-1.5 text-stone-600 hover:text-orange-600 px-2 py-2 transition-all font-medium text-sm whitespace-nowrap"
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
                  className={`flex h-8 px-3 gap-1 rounded-full text-[10px] sm:text-xs font-bold transition-all cursor-pointer border-2 ${
                    tier === "pro" 
                      ? "bg-amber-500 border-amber-600 text-white shadow-sm hover:bg-amber-600" 
                      : "bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100"
                  }`}
                >
                  <Sparkles className={`h-3 w-3 ${tier === "pro" ? "fill-white" : "text-stone-400"}`} />
                  <span>{tier === "pro" ? "Pro Chef" : "Free Plan"}</span>
                </Badge>
              </PricingModal>
              <UserDropdown />
            </div>
          </SignedIn>

          <SignedOut>
            <div className="flex items-center space-x-2">
              <SignInButton mode="modal">
                <Button variant="ghost" size="sm" className="text-stone-600 hover:text-orange-600">
                    Sign In
                </Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button size="sm" className="bg-orange-600 hover:bg-orange-700 text-white rounded-full px-4 sm:px-6 shadow-sm">
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