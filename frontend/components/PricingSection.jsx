import { PricingTable } from '@clerk/nextjs'
import React from 'react'

const PricingSection = () => {
  return (
    <div >
        <div className='mb-16'>
            <h2 className='text-3xl md:text-6xl font-bold mb-4'>
    Simple Pricing for Everyone
            </h2>
            <p className='text-xl text-stone-600 max-w-2xl mx-auto'>Start for free. Upgrade to become a master chef</p>

        </div>

    <div className='max-w-4xl'>
            <PricingTable checkoutProps={{
        appearance:{
          elements:{
            drawerRoot:{
              zIndex:2000,
            },
                   },
        },
      }}/>
    </div>

    </div>
  )
}

export default PricingSection