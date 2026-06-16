import { Route, Routes } from 'react-router-dom';
import { Home } from './components/Home';
import { FocusLoop } from './components/FocusLoop';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/focus" element={<FocusLoop />} />
    </Routes>
  );
}
