"use client"

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'

const PricingModal = ({subscriptionTier="free",children}) => {
    const [isOpen, setIsOpen] = useState(false);

    const canOpen = subscriptionTier === "free";

  return (
    <div>

        <Dialog open={isOpen} onOpenChange={canOpen? setIsOpen : undefined}> 
  <DialogTrigger>{children}</DialogTrigger>
  <DialogContent>
    
      <DialogTitle>Are you absolutely sure?</DialogTitle>
   
  </DialogContent>
</Dialog>
    </div>
  )
}

export default PricingModal