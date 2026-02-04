import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PricingTable } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { ArrowRight, Flame, Clock, Users, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default async function Home() {
  const { has } = await auth();
  const isPro = has({ permission: "org:pro:access" });

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans">
      <section className="pt-16 pb-16 px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Main Hero Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center mb-20">
            
            {/* Left Content */}
            <div className="flex flex-col items-center lg:items-start text-center lg:text-left order-2 lg:order-1">
              <Badge className="bg-orange-600/10 hover:bg-orange-600/20 text-orange-700 border-orange-200 px-3 py-1 rounded-full mb-5 transition-colors">
                <Flame className="mr-2 h-3.5 w-3.5 fill-orange-600" />
                <span className="text-xs font-bold tracking-wide uppercase">#1 AI Cooking Assistant</span>
              </Badge>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-5 leading-[1.1] tracking-tight text-stone-950">
                Cook <span className="text-orange-600 underline decoration-stone-200 underline-offset-4">Smarter</span>, <br className="hidden md:block" />
                Not Harder
              </h1>
              
              <p className="text-base md:text-lg text-stone-600 mb-8 max-w-md leading-relaxed">
                Personalized recipes based on your pantry. Generate, track macros, and get step-by-step AI guidance.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center gap-5 w-full sm:w-auto">
                <Link href="/dashboard" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full bg-orange-600 hover:bg-orange-700 px-7 py-5 text-base font-semibold rounded-lg shadow-md transition-all active:scale-95">
                    Start Cooking Now <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <div className="flex flex-col items-center lg:items-start border-l-0 lg:border-l lg:pl-5 border-stone-200">
                  <span className="font-bold text-base text-stone-900 tracking-tight">10k+ users</span>
                  <span className="text-stone-500 text-[12px]">joined last month</span>
                </div>
              </div>
            </div>

            {/* Right Image Container - Scaled Down */}
            <div className="relative group order-1 lg:order-2 w-full max-w-[420px] lg:max-w-[480px] mx-auto">
              <div className="relative rounded-[1.5rem] lg:rounded-[2rem] overflow-hidden shadow-xl border-[6px] lg:border-[10px] border-white ring-1 ring-stone-200/50">
                <Image
                  src="/pasta-dish.png" 
                  alt="Rustic Tomato Basil Pasta"
                  width={600}
                  height={750}
                  className="w-full aspect-[4/5] object-cover transition-transform duration-500 group-hover:scale-105"
                  priority
                />
                
                {/* Floating Recipe Card - More Compact */}
                <div className="absolute bottom-4 left-4 right-4">
                  <Card className="bg-white/95 backdrop-blur-md border-none shadow-xl">
                    <CardContent className="p-4 lg:p-5">
                      <div className="flex justify-between items-start border-b border-stone-100 pb-3 mb-3">
                        <div>
                          <p className="text-orange-600 text-[10px] font-bold uppercase tracking-wider mb-1">Featured Recipe</p>
                          <h3 className="text-base lg:text-lg font-bold text-stone-900 leading-tight">
                            Rustic Tomato Pasta
                          </h3>
                          <div className="flex items-center gap-1 mt-1.5">
                            <Star className="w-3.5 h-3.5 fill-orange-500 text-orange-500" />
                            <span className="text-[12px] font-bold text-stone-700">4.8</span>
                            <span className="text-[11px] text-stone-400 font-medium">(2.4k reviews)</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center px-1">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-stone-400" />
                          <span className="text-[12px] font-semibold text-stone-700">20 min</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-stone-400" />
                          <span className="text-[12px] font-semibold text-stone-700">4 Servings</span>
                        </div>
                        <div className="h-4 w-[1px] bg-stone-200" />
                        <span className="text-[11px] font-bold text-stone-400 uppercase">Easy</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing Section - Compacted */}
          <div className="mt-24 lg:mt-32">
            <div className="text-center mb-8 lg:mb-12">
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-stone-900">Simple, Transparent Pricing</h2>
              <div className="h-1 w-12 bg-orange-600 mx-auto mt-3 rounded-full" />
            </div>
            
            <div className="bg-white rounded-2xl p-2 lg:p-6 shadow-lg border border-stone-100 max-w-4xl mx-auto">
              <PricingTable 
                checkoutProps={{
                  appearance: {
                    elements: {
                      drawerRoot: { zIndex: 2000 },
                      card: { boxShadow: 'none' }
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}