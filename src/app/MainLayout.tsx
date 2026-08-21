import { useLocation } from "react-router-dom";
import { Outlet } from "react-router-dom";
import { Sidebar, SidebarItem } from "../shared/components";
import { useTheme } from "../shared/hooks/useTheme";
import styles from "./MainLayout.module.css";

const navigationItems: SidebarItem[] = [
  { label: "Dashboard", icon: "📊", path: "/" },
  { label: "Repositories", icon: "📦", path: "/repositories" },
  { label: "Profile", icon: "👤", path: "/profile" },
  { label: "Settings", icon: "⚙️", path: "/settings" },
];

export function MainLayout() {
  const { isDark, setTheme } = useTheme();
  const location = useLocation();

  return (
    <div className={styles.layout}>
      <Sidebar
        items={navigationItems}
        activeItem={location.pathname}
        logo="🤖"
        title="AI ARCHAEOLOGIST"
      />
      <div className={styles.content}>
        <header className={styles.header}>
          <div></div>
          <div className={styles.headerActions}>
            <button
              className={styles.themeToggle}
              onClick={() => setTheme(isDark ? "light" : "dark")}
              title={`Switch to ${isDark ? "light" : "dark"} mode`}
            >
              {isDark ? "☀️" : "🌙"}
            </button>
          </div>
        </header>
        <main className={styles.main}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
