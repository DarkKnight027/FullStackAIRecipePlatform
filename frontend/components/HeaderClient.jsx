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
  const tier = user?.subscriptionTier ?? 'free';

  return (
    <header className="fixed top-0 w-full border-b border-stone-200 bg-stone-50/80 backdrop-blur-md z-50 supports-backdrop-blur-md">
      <nav className="containter mx-auto px-4 h-16 flex items-center justify-between">
        <Link href={user ? "/dashboard" : "/"}>
          <Image src="/logo2.png" alt="Logo" width={60} height={60} className="w-16" />
        </Link>

        <div className="hidden md:flex items-center space-x-8 text-sm font-medium">
          <Link href="/recipes" className="text-stone-600 hover:text-orange-600 hover:bg-orange-50 px-3 py-2 rounded-md font-medium">
            <Cookie className="w-4 h-4" /> My Recipes
          </Link>

          <Link href="/pantry" className="text-stone-600 hover:text-orange-600 hover:bg-orange-50 px-3 py-2 rounded-md font-medium">
            <Refrigerator className="w-4 h-4" /> My Pantry
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          <SignedIn>
            <div className="flex items-center space-x-2">
              <PricingModal subscriptionTier={tier}>
                <Badge>
                  <Sparkles className={`h-3 w-3 ${tier === "pro" ? "text-white fill-white/20" : "text-stone-500"}`} />
                  <span>{tier === "pro" ? "Pro" : "Free"}</span>
                </Badge>
              </PricingModal>
              <UserDropdown />
            </div>
          </SignedIn>

          <SignedOut>
            <SignInButton mode="modal">
              <Button variant="ghost" className="text-stone-600 hover:text-orange-600 hover:bg-orange-50 font-medium">Sign In</Button>
            </SignInButton>
            <SignUpButton mode="modal">
              <Button variant="primary" className="rounded-full px-6">Get Started</Button>
            </SignUpButton>
          </SignedOut>
        </div>
      </nav>
    </header>
  );
}
