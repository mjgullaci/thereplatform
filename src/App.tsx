import { Link, Route, Routes } from 'react-router-dom';
import { Home } from './screens/Home';
import { DailyPuzzle } from './screens/DailyPuzzle';
import { Settings } from './screens/Settings';
import { Premium } from './screens/Premium';
import { Privacy } from './screens/Privacy';
import { About } from './screens/About';

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
          <Route path="/premium" element={<Premium />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </main>
      <footer className="px-4 py-3 text-center text-cocoa/50 text-sm flex items-center justify-center gap-3 flex-wrap">
        <span>A Hearthword Games title · v0.2</span>
        <span aria-hidden>·</span>
        <Link to="/about" className="underline-offset-4 hover:underline">About</Link>
        <span aria-hidden>·</span>
        <Link to="/privacy" className="underline-offset-4 hover:underline">Privacy</Link>
      </footer>
    </div>
  );
}
