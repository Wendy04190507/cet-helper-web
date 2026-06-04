import { HashRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './contexts/AppContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Onboarding from './pages/Onboarding';
import WordReview from './pages/WordReview';
import Pomodoro from './pages/Pomodoro';
import WeeklyReport from './pages/WeeklyReport';
import Settings from './pages/Settings';
import Listening from './pages/Listening';
import ListeningDetail from './pages/ListeningDetail';
import Reading from './pages/Reading';
import ReadingDetail from './pages/ReadingDetail';
import Writing from './pages/Writing';
import WritingDetail from './pages/WritingDetail';
import Translation from './pages/Translation';
import TranslationDetail from './pages/TranslationDetail';
import Report from './pages/Report';
import ErrorBook from './pages/ErrorBook';

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
            <Route path="/listening" element={<Listening />} />
            <Route path="/listening/:id" element={<ListeningDetail />} />
            <Route path="/reading" element={<Reading />} />
            <Route path="/reading/:id" element={<ReadingDetail />} />
            <Route path="/writing" element={<Writing />} />
            <Route path="/writing/:id" element={<WritingDetail />} />
            <Route path="/translation" element={<Translation />} />
            <Route path="/translation/:id" element={<TranslationDetail />} />
            <Route path="/report" element={<Report />} />
            <Route path="/error-book" element={<ErrorBook />} />
          </Routes>
        </Layout>
      </AppProvider>
    </HashRouter>
  );
}
