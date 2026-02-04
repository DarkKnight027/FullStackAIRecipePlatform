import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SITE_STATS, FEATURES, HOW_IT_WORKS_STEPS } from "@/lib/data";
import { PricingTable } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { ArrowRight, Flame, Clock, Users, Star, Github, Twitter, Instagram } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default async function Home() {
  const { has } = await auth();
  
  return (
    <div className="min-h-screen bg-white text-stone-900 font-sans flex flex-col">
      <main className="flex-grow">
        
        {/* HERO SECTION */}
        <section className="pt-24 pb-16 px-6 lg:px-8 bg-stone-50/50">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center mb-20">
              
              {/* Left Content */}
              <div className="flex flex-col items-center lg:items-start text-center lg:text-left order-2 lg:order-1">
                <Badge className="bg-orange-600/10 text-orange-700 border-orange-200/50 px-3 py-1 rounded-full mb-5">
                  <Flame className="mr-2 h-3.5 w-3.5 fill-orange-600" />
                  <span className="text-xs font-bold tracking-wide uppercase">#1 AI Cooking Assistant</span>
                </Badge>
                
                <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold mb-5 leading-[1.05] tracking-tight text-stone-900">
                  Cook <span className="text-orange-600 italic">Smarter</span>, <br className="hidden md:block" />
                  Not Harder
                </h1>
                
                <p className="text-base md:text-lg text-stone-600 mb-8 max-w-md leading-relaxed">
                  Personalized recipes based on your pantry. Generate, track macros, and get step-by-step AI guidance.
                </p>
                
                <div className="flex flex-col sm:flex-row items-center gap-5 w-full sm:w-auto">
                  <Link href="/dashboard" className="w-full sm:w-auto">
                    <Button size="lg" className="w-full bg-orange-600 hover:bg-orange-700 px-8 py-6 text-lg font-bold rounded-xl shadow-xl shadow-orange-100 transition-all active:scale-95">
                      Start Cooking Now <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Right Image Container */}
              <div className="relative group order-1 lg:order-2 w-full max-w-[480px] mx-auto cursor-pointer">
                <div className="relative rounded-[2rem] overflow-hidden shadow-2xl border-[10px] border-white transition-all duration-500 group-hover:shadow-orange-200/40">
                  
                  <div className="overflow-hidden">
                    <Image 
                      src="/pasta-dish.png" 
                      alt="Recipe Preview" 
                      width={600} 
                      height={750} 
                      className="w-full aspect-[4/5] object-cover transition-transform duration-700 group-hover:scale-105" 
                      priority 
                    />
                  </div>

                  {/* Floating Card - Orange Accents Standardized */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <Card className="bg-white/95 backdrop-blur-md border-none shadow-xl">
                      <CardContent className="p-5">
                        <div className="flex justify-between items-start border-b border-stone-100 pb-3 mb-3">
                          <div>
                            <p className="text-orange-600 text-[10px] font-bold uppercase tracking-wider mb-1">
                              Featured Recipe
                            </p>
                            <h3 className="text-lg font-bold text-stone-900">
                              Rustic Tomato Pasta
                            </h3>
                            <div className="flex items-center gap-1 mt-1">
                              <Star className="w-3.5 h-3.5 fill-orange-600 text-orange-600" />
                              <span className="text-[12px] font-bold text-stone-700">4.8</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center text-stone-500">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span className="text-[12px] font-semibold">20 min</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            <span className="text-[12px] font-semibold">4 Servings</span>
                          </div>
                          <span className="text-[11px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded">EASY</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* STATS SECTION - Deep Stone for Contrast */}
        <section className="py-12 bg-stone-900 text-white">
          <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {SITE_STATS.map((stat, index) => (
              <div key={index}>
                <p className="text-3xl font-bold text-orange-500">{stat.val}</p>
                <p className="text-xs text-stone-400 mt-1 uppercase tracking-widest">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FEATURES - Smart Kitchen */}
        <section className="py-24 px-6 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4 tracking-tight">Your Smart Kitchen</h2>
              <div className="h-1.5 w-16 bg-orange-600 mx-auto rounded-full mb-4" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {FEATURES.map((feature, index) => (
                <Card key={index} className="border-stone-100 hover:border-orange-200 transition-all hover:shadow-lg group">
                  <CardContent className="p-6">
                    <div className="p-3 bg-orange-50 rounded-xl mb-4 text-orange-600 w-fit group-hover:bg-orange-600 group-hover:text-white transition-colors">
                      <feature.icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                    <p className="text-sm text-stone-500 mb-4">{feature.description}</p>
                    <Badge variant="secondary" className="bg-stone-100 text-stone-500 group-hover:bg-orange-100 group-hover:text-orange-700 transition-colors">
                        {feature.limit}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="py-24 bg-stone-50">
          <div className="max-w-6xl mx-auto px-6 text-center">
             <h2 className="text-4xl font-bold mb-16 tracking-tight">Cook in 3 Simple Steps</h2>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                {HOW_IT_WORKS_STEPS.map((step, index) => (
                    <div key={index} className="relative flex flex-col items-center">
                        <div className="w-14 h-14 rounded-full bg-orange-600 text-white flex items-center justify-center font-bold text-xl mb-6 shadow-xl shadow-orange-100">
                            {index + 1}
                        </div>
                        <h3 className="text-xl font-bold mb-3 uppercase tracking-wider">{step.title}</h3>
                        <p className="text-stone-500 max-w-xs">{step.desc}</p>
                    </div>
                ))}
             </div>
          </div>
        </section>

      </main>

      {/* FOOTER - Branded with Swadistt Orange */}
      <footer className="bg-stone-900 py-16 text-stone-400">
        <div className="max-w-6xl mx-auto px-8 grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="col-span-1 md:col-span-2">
                <div className="flex items-center gap-2 mb-6">
                    <div className="bg-orange-600 p-2 rounded-xl">
                        <Flame className="w-6 h-6 text-white fill-white" />
                    </div>
                    <span className="text-2xl font-bold text-white tracking-tight">Swadistt</span>
                </div>
                <p className="max-w-sm text-stone-400 leading-relaxed">
                    Elevating your cooking experience through AI. Save time, reduce waste, and discover flavor.
                </p>
            </div>
            <div>
                <h4 className="font-bold text-white mb-6 uppercase text-xs tracking-[0.2em]">Social</h4>
                <div className="flex gap-5">
                    <Twitter className="w-5 h-5 hover:text-orange-500 transition-colors cursor-pointer" />
                    <Instagram className="w-5 h-5 hover:text-orange-500 transition-colors cursor-pointer" />
                    <Github className="w-5 h-5 hover:text-orange-500 transition-colors cursor-pointer" />
                </div>
            </div>
            <div className="text-xs flex flex-col justify-end">
                <p>© {new Date().getFullYear()} Swadistt AI. All rights reserved.</p>
            </div>
        </div>
      </footer>
    </div>
  );
}