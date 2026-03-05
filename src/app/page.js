import Link from 'next/link';
import { ArrowRight, ShieldCheck, Map, Clock } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="max-w-4xl mx-auto w-full flex flex-col items-center text-center space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">

        <div className="space-y-6 flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-purple-200/50 text-sm font-medium text-purple-800 dark:text-purple-200 mb-4 shadow-sm w-fit">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-purple-500"></span>
            </span>
            Transforming Neighborhoods Together
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight">
            Fix your street, <br className="hidden md:block" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-fuchsia-500 dark:from-purple-400 dark:to-fuchsia-400">
              improve your city.
            </span>
          </h1>

          <p className="text-lg md:text-xl opacity-80 max-w-2xl mx-auto leading-relaxed">
            The civic issue management platform that connects residents with municipal authorities. Report potholes, broken streetlights, or waste issues in seconds.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mt-8">
          <Link href="/register" className="btn-primary py-4 px-8 text-lg flex items-center justify-center gap-2 group">
            Report an Issue
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link href="/login" className="btn-secondary py-4 px-8 text-lg flex items-center justify-center">
            Authority Login
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full mt-16 pt-16 border-t border-gray-200 dark:border-gray-800">
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <Map size={24} />
            </div>
            <h3 className="font-bold text-xl">Pinpoint Accuracy</h3>
            <p className="opacity-70 text-sm leading-relaxed">Use your device&apos;s GPS to log the exact location of the issue instantly.</p>
          </div>
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-fuchsia-100 dark:bg-fuchsia-900/40 flex items-center justify-center text-fuchsia-600 dark:text-fuchsia-400">
              <Clock size={24} />
            </div>
            <h3 className="font-bold text-xl">Real-time Tracking</h3>
            <p className="opacity-70 text-sm leading-relaxed">Monitor the progress of your reports from pending to resolved.</p>
          </div>
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <ShieldCheck size={24} />
            </div>
            <h3 className="font-bold text-xl">Direct Action</h3>
            <p className="opacity-70 text-sm leading-relaxed">Your reports go straight to the local authorities who can fix them.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
