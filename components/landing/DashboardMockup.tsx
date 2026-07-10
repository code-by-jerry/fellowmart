import {
  BarChart3,
  LayoutDashboard,
  Package,
  Percent,
  Settings,
  ShoppingCart,
  Users,
} from "lucide-react";
import styles from "./landing.module.css";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", active: true },
  { icon: Package, label: "Catalog" },
  { icon: ShoppingCart, label: "Orders" },
  { icon: Users, label: "Customers" },
  { icon: BarChart3, label: "Analytics" },
  { icon: Percent, label: "Discounts" },
  { icon: Settings, label: "Settings" },
];

const stats = [
  { label: "Total Orders", value: "1,428", trend: "+12.5%", up: true },
  { label: "Total Sales", value: "$24,680", trend: "+8.2%", up: true },
  { label: "Active Products", value: "320", trend: "+4.1%", up: true },
  { label: "New Customers", value: "860", trend: "-2.4%", up: false },
];

const orders = [
  { id: "#FM-1042", customer: "Sarah J.", total: "$129.00", status: "Paid" },
  { id: "#FM-1041", customer: "Michael B.", total: "$89.50", status: "Paid" },
  { id: "#FM-1040", customer: "Emily D.", total: "$210.00", status: "Pending" },
];

export function DashboardMockup() {
  return (
    <div className={`${styles.mockupShell} ${styles.mockupFloat}`} aria-hidden="true">
      <div className={styles.mockup}>
        <aside className={styles.mockupSidebar}>
          <div className={styles.mockupSidebarBrand}>
            <span className={styles.mockupSidebarMark}>FM</span>
            <span>Business</span>
          </div>
          <nav className={styles.mockupSidebarNav}>
            {navItems.map(({ icon: Icon, label, active }) => (
              <div
                key={label}
                className={`${styles.mockupNavItem} ${active ? styles.mockupNavItemActive : ""}`}
              >
                <Icon size={14} />
                <span>{label}</span>
              </div>
            ))}
          </nav>
        </aside>

        <div className={styles.mockupMain}>
          <div className={styles.mockupTopbar}>
            <div>
              <p className={styles.mockupGreeting}>Welcome back, Alex</p>
              <p className={styles.mockupSubGreeting}>Here&apos;s what&apos;s happening today.</p>
            </div>
            <span className={styles.mockupAvatar}>A</span>
          </div>

          <div className={styles.mockupStats}>
            {stats.map((stat) => (
              <div key={stat.label} className={styles.mockupStatCard}>
                <p>{stat.label}</p>
                <strong>{stat.value}</strong>
                <span className={stat.up ? styles.trendUp : styles.trendDown}>
                  {stat.trend}
                </span>
              </div>
            ))}
          </div>

          <div className={styles.mockupPanels}>
            <div className={styles.mockupChartCard}>
              <div className={styles.mockupChartHeader}>
                <strong>Sales Overview</strong>
                <span>Last 7 days</span>
              </div>
              <div className={styles.mockupChart}>
                <svg viewBox="0 0 320 80" className={styles.mockupChartSvg}>
                  <defs>
                    <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="currentColor" stopOpacity="0.12" />
                      <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M0 58 L40 48 L80 52 L120 36 L160 42 L200 28 L240 32 L280 18 L320 24 L320 80 L0 80 Z"
                    fill="url(#chartFill)"
                  />
                  <path
                    d="M0 58 L40 48 L80 52 L120 36 L160 42 L200 28 L240 32 L280 18 L320 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>

            <div className={styles.mockupOrdersCard}>
              <strong>Recent Orders</strong>
              <table className={styles.mockupTable}>
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Customer</th>
                    <th>Total</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td>{order.id}</td>
                      <td>{order.customer}</td>
                      <td>{order.total}</td>
                      <td>
                        <span
                          className={
                            order.status === "Paid"
                              ? styles.statusPaid
                              : styles.statusPending
                          }
                        >
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
