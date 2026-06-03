import { HashRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './contexts/AppContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Onboarding from './pages/Onboarding';
import WordReview from './pages/WordReview';
import Pomodoro from './pages/Pomodoro';
import WeeklyReport from './pages/WeeklyReport';
import Settings from './pages/Settings';

export default function App() {
  return (
    <HashRouter>
      <AppProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/word-review" element={<WordReview />} />
            <Route path="/pomodoro" element={<Pomodoro />} />
            <Route path="/weekly-report" element={<WeeklyReport />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </Layout>
      </AppProvider>
    </HashRouter>
  );
}
