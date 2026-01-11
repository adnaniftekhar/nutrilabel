import LabelCapture from "@/components/LabelCapture";
import BottomNav from "@/components/BottomNav";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 pb-24 md:pb-0">
      {/* Brand header */}
      <header className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-200 z-40 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-green-600 flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">NL</span>
          </div>
          <h1 className="text-lg font-bold text-gray-900">NutriLabel</h1>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-4xl mx-auto px-4 py-6 md:py-8">
        <div className="mb-6 md:mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Analyze Nutrition Labels
          </h2>
          <p className="text-gray-600 text-sm md:text-base">
            Capture or upload a nutrition label to get personalized AI-powered health scores
          </p>
        </div>

        <LabelCapture />
      </main>

      {/* Bottom navigation (mobile) */}
      <BottomNav />
    </div>
  );
}
