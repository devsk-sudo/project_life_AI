import { Heart } from 'lucide-react';

export function Header() {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-8 px-6 shadow-lg">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-2">
          <Heart className="w-8 h-8" />
          <h1 className="text-4xl font-bold">Hospital Surge Prediction</h1>
        </div>
        <p className="text-blue-100 text-lg">72-hour Outlook for Hospital Administrator</p>
        <div className="h-1 bg-gradient-to-r from-blue-400 to-cyan-400 mt-4 rounded-full"></div>
      </div>
    </div>
  );
}
