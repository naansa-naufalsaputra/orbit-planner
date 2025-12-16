import { Outlet, Link, useLocation } from "react-router-dom";
import { LayoutDashboard, StickyNote, Calendar, CheckSquare, LogOut, Orbit, Sun, Moon, GraduationCap, User } from "lucide-react";
import clsx from "clsx";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

export default function Layout() {
    const location = useLocation();
    const { logout } = useAuth();
    const [isDark, setIsDark] = useState(() => {
        if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            return true;
        }
        return false;
    });

    useEffect(() => {
        if (isDark) {
            document.documentElement.classList.add('dark');
            localStorage.theme = 'dark';
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.theme = 'light';
        }
    }, [isDark]);

    const navItems = [
        { href: "/", label: "Dashboard", icon: LayoutDashboard },
        { href: "/notes", label: "Notes", icon: StickyNote },
        { href: "/schedule", label: "Schedule", icon: Calendar },
        { href: "/tasks", label: "Tasks", icon: CheckSquare },
        { href: "/grades", label: "Nilai", icon: GraduationCap },
        { href: "/calendar", label: "Calendar", icon: Calendar },
        { href: "/profile", label: "Profil", icon: User },
    ];

    return (
        <div className="flex min-h-screen bg-background text-foreground font-sans flex-col md:flex-row">
            {/* Sidebar for Desktop */}
            <aside className="w-64 border-r border-border bg-card p-6 hidden md:flex flex-col">
                <div className="mb-8 pl-2">
                    <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
                        <Orbit size={28} className="text-primary" />
                        Orbit
                    </h2>
                </div>

                <nav className="space-y-2 flex-1">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.href || (item.href !== "/" && location.pathname.startsWith(item.href));
                        return (
                            <Link
                                key={item.href}
                                to={item.href}
                                className={clsx(
                                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                                    isActive
                                        ? "bg-primary text-primary-foreground shadow-sm"
                                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                )}
                            >
                                <Icon size={20} />
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="mt-auto pt-4 border-t border-border space-y-2">
                    <button
                        onClick={() => setIsDark(!isDark)}
                        className="flex items-center gap-3 px-4 py-3 text-muted-foreground hover:text-foreground transition-colors w-full text-left rounded-lg hover:bg-muted/50"
                    >
                        {isDark ? <Sun size={20} /> : <Moon size={20} />}
                        <span className="font-medium">{isDark ? "Light Mode" : "Dark Mode"}</span>
                    </button>
                    <button
                        onClick={() => logout()}
                        className="flex items-center gap-3 px-4 py-3 text-muted-foreground hover:text-destructive transition-colors w-full text-left rounded-lg hover:bg-muted/50"
                    >
                        <LogOut size={20} />
                        <span className="font-medium">Logout</span>
                    </button>
                </div>
            </aside>

            {/* Mobile Header */}
            <header className="md:hidden flex items-center justify-between p-4 border-b border-border bg-card sticky top-0 z-50">
                <div className="flex items-center gap-2">
                    <Orbit size={24} className="text-primary" />
                    <span className="font-bold text-lg">Orbit</span>
                </div>
                <button onClick={() => setIsDark(!isDark)} className="p-2 rounded-full hover:bg-muted">
                    {isDark ? <Sun size={20} /> : <Moon size={20} />}
                </button>
            </header>

            {/* Main Content */}
            <main className="flex-1 overflow-auto bg-secondary/20 pb-20 md:pb-0">
                <Outlet />
            </main>

            {/* Mobile Bottom Navigation */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border flex justify-start overflow-x-auto p-2 z-50 pb-safe gap-2 no-scrollbar">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.href || (item.href !== "/" && location.pathname.startsWith(item.href));
                    return (
                        <Link
                            key={item.href}
                            to={item.href}
                            className={clsx(
                                "flex flex-col items-center gap-1 p-2 rounded-lg transition-all w-16 shrink-0",
                                isActive
                                    ? "text-primary bg-primary/10"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <Icon size={24} />
                            <span className="text-[10px] font-medium">{item.label}</span>
                        </Link>
                    );
                })}
                <button onClick={() => logout()} className="flex flex-col items-center gap-1 p-2 rounded-lg text-muted-foreground hover:text-destructive w-16">
                    <LogOut size={24} />
                    <span className="text-[10px] font-medium">Logout</span>
                </button>
            </nav>
        </div>
    );
}
