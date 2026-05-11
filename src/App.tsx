import { Link, Route, Routes } from 'react-router-dom';
import { Home } from './screens/Home';
import { DailyPuzzle } from './screens/DailyPuzzle';
import { Settings } from './screens/Settings';

export default function App() {
  return (
    <div className="min-h-full flex flex-col bg-cream">
      <header className="border-b border-cocoa/15 px-4 py-3 flex items-center justify-between">
        <Link to="/" className="font-display text-xl text-cocoa tracking-wide">
          Wordwell
        </Link>
        <Link to="/settings" className="text-cocoa/70 underline-offset-4 hover:underline">
          Settings
        </Link>
      </header>
      <main className="flex-1 flex flex-col">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/play" element={<DailyPuzzle />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>
      <footer className="px-4 py-3 text-center text-cocoa/50 text-sm">
        A Hearthword Games title · v0.1
      </footer>
    </div>
  );
}
