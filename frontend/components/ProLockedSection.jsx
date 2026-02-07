import React from 'react';
import { Lock } from 'lucide-react';

// Use "export default" to match your import in page.jsx
export default function ProLockedSection({ isPro, children, lockText }) {
  if (isPro) return children;

  return (
    <div className="relative border-2 border-dashed border-stone-200 p-6 rounded-lg bg-stone-50/50">
      <div className="flex flex-col items-center text-center gap-3">
        <Lock className="w-8 h-8 text-stone-400" />
        <p className="text-stone-600 font-medium">{lockText}</p>
        <button className="bg-orange-600 text-white px-4 py-2 rounded">
          Upgrade to Pro
        </button>
      </div>
    </div>
  );
}