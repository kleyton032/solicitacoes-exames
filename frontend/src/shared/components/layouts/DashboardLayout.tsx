import { Link, Outlet, useLocation } from 'react-router-dom';
import { FileText, Calendar, LogOut, Menu } from 'lucide-react';
import { useState } from 'react';

export function DashboardLayout() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const location = useLocation();

    const menuItems = [
        { path: '/dashboard/solicitacoes', label: 'Consultas/Exames', icon: FileText },
        { path: '/dashboard/pre-agendamento', label: 'Pré-agendamento', icon: Calendar },
    ];

    return (
        <div className="flex" style={{ minHeight: '100vh', background: 'var(--background-color)' }}>
            {/* Sidebar */}
            <aside
                style={{
                    width: isSidebarOpen ? '260px' : '80px',
                    background: 'var(--surface-color)',
                    borderRight: '1px solid var(--border-color)',
                    transition: 'width 300ms ease',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'sticky',
                    top: 0,
                    height: '100vh',
                    zIndex: 10
                }}
            >
                <div className="flex items-center justify-between" style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
                    {isSidebarOpen && (
                        <span style={{ fontWeight: '700', fontSize: '1.25rem', color: 'var(--primary-color)' }}>
                            Fila de Espera
                        </span>
                    )}
                    <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} style={{ padding: '0.5rem', color: 'var(--text-secondary)' }}>
                        <Menu size={20} />
                    </button>
                </div>

                <nav className="flex flex-col" style={{ padding: '1rem', gap: '0.5rem', flex: 1 }}>
                    {menuItems.map((item) => {
                        const isActive = location.pathname.startsWith(item.path);
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className="flex items-center"
                                style={{
                                    padding: '0.75rem 1rem',
                                    borderRadius: 'var(--radius-md)',
                                    color: isActive ? 'var(--primary-color)' : 'var(--text-secondary)',
                                    background: isActive ? '#eff6ff' : 'transparent',
                                    fontWeight: isActive ? 600 : 500,
                                    transition: 'all 200ms',
                                    gap: '0.75rem'
                                }}
                            >
                                <Icon size={20} />
                                {isSidebarOpen && <span>{item.label}</span>}
                            </Link>
                        );
                    })}
                </nav>

                <div style={{ padding: '1rem', borderTop: '1px solid var(--border-color)' }}>
                    <Link
                        to="/login"
                        className="flex items-center"
                        style={{
                            padding: '0.75rem 1rem',
                            color: 'var(--text-secondary)',
                            gap: '0.75rem',
                            borderRadius: 'var(--radius-md)'
                        }}
                    >
                        <LogOut size={20} />
                        {isSidebarOpen && <span>Sair</span>}
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
                <div className="container">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
