import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './modules/users/pages/LoginPage';
import { DashboardLayout } from './shared/components/layouts/DashboardLayout';
import { SolicitacoesList } from './modules/solicitacoes/pages/SolicitacoesList';
import { PreAgendamentoList } from './modules/preAgendamento/pages/PreAgendamentoList';
import { UsersListPage } from './modules/users/pages/UsersListPage';

import { AuthProvider } from './modules/users/contexts/AuthContext';
import { PrivateRoute } from './shared/components/PrivateRoute';
import { AdminRoute } from './shared/components/AdminRoute';

import { ConfigProvider } from 'antd';
import { theme } from './shared/theme/theme';

function App() {
  return (
    <ConfigProvider theme={theme}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            <Route path="/dashboard" element={<PrivateRoute />}>
              <Route element={<DashboardLayout />}>
                <Route path="solicitacoes" element={<SolicitacoesList />} />
                <Route path="pre-agendamento" element={<PreAgendamentoList />} />
                <Route index element={<Navigate to="solicitacoes" replace />} />
              </Route>
            </Route>

            <Route path="/admin" element={<AdminRoute />}>
              <Route element={<DashboardLayout />}>
                <Route path="users" element={<UsersListPage />} />
                <Route index element={<Navigate to="users" replace />} />
              </Route>
            </Route>

            <Route path="/" element={<Navigate to="/dashboard/solicitacoes" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ConfigProvider>
  );
}

export default App;
