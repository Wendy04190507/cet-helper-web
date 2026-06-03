import BottomNav from './BottomNav';

export default function Layout({ children }) {
  return (
    <div className="min-h-dvh pb-16 relative">
      <main>{children}</main>
      <BottomNav />
    </div>
  );
}
