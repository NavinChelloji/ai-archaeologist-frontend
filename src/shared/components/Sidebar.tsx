import { forwardRef, type HTMLAttributes } from "react";
import { Link } from "react-router-dom";
import styles from "./Sidebar.module.css";

export interface SidebarItem {
  label: string;
  icon?: React.ReactNode;
  path: string;
  badge?: React.ReactNode;
}

export interface SidebarProps extends HTMLAttributes<HTMLDivElement> {
  items: SidebarItem[];
  activeItem?: string;
  logo?: React.ReactNode;
  title?: string;
  collapsed?: boolean;
}

export const Sidebar = forwardRef<HTMLDivElement, SidebarProps>(
  function Sidebar(
    {
      items,
      activeItem,
      logo,
      title,
      collapsed = false,
      className,
      ...props
    },
    ref
  ) {
    return (
      <aside
        ref={ref}
        className={[styles.sidebar, collapsed && styles.collapsed, className]
          .filter(Boolean)
          .join(" ")}
        {...props}
      >
        {(logo || title) && (
          <div className={styles.header}>
            {logo && <div className={styles.logo}>{logo}</div>}
            {title && !collapsed && <h1 className={styles.title}>{title}</h1>}
          </div>
        )}

        <nav className={styles.nav}>
          {items.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={[
                styles.item,
                activeItem === item.path && styles.active,
              ]
                .filter(Boolean)
                .join(" ")}
              title={collapsed ? item.label : undefined}
            >
              {item.icon && <span className={styles.icon}>{item.icon}</span>}
              {!collapsed && (
                <>
                  <span className={styles.label}>{item.label}</span>
                  {item.badge && <span className={styles.badge}>{item.badge}</span>}
                </>
              )}
            </Link>
          ))}
        </nav>
      </aside>
    );
  }
);
