"use client"

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import PricingSection from './PricingSection';


const PricingModal = ({subscriptionTier="free",children}) => {
    const [isOpen, setIsOpen] = useState(false);

    const canOpen = subscriptionTier === "free";

  return (
    <div>

        <Dialog open={isOpen} onOpenChange={canOpen? setIsOpen : undefined}> 
  <DialogTrigger>{children}</DialogTrigger>
  <DialogContent className="p-8 pt-4 sm:max-w-4xl">
    
      <DialogTitle>Are you absolutely sure?</DialogTitle>
      <PricingSection/>
   
  </DialogContent>
</Dialog>
    </div>
  )
}

export default PricingModal