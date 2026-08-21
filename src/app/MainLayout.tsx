import type { ReactElement } from "react";
import { useLocation, Outlet } from "react-router-dom";
import { Sidebar, SidebarItem } from "../shared/components";
import styles from "./MainLayout.module.css";

const navigationItems: SidebarItem[] = [
  { label: "Dashboard", icon: "\u2302", path: "/" },
  { label: "Repositories", icon: "\u25A6", path: "/repositories" },
  { label: "Profile", icon: "\u25CF", path: "/profile" },
  { label: "Settings", icon: "\u2699", path: "/settings" },
];

export function MainLayout(): ReactElement {
  const location = useLocation();
  return (
    <div className={styles.layout}>
      <Sidebar items={navigationItems} activeItem={location.pathname} logo="AI" title="AI ARCHITECT" />
      <div className={styles.content}>
        <div className={styles.mobileBrand}>AI ARCHITECT</div>
        <main className={styles.main}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
