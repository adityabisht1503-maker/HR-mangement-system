import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Provider } from 'react-redux'
import store from './store/store.jsx'
import ProtectedRoute from './ProtectedRoute.jsx'

import LoginPage      from './pages/auth/LoginPage.jsx'
import RegisterPage   from './pages/auth/RegisterPage.jsx'
import ForgotPage     from './pages/auth/ForgotPage.jsx'
import DashboardPage  from './pages/dashboard/DashboardPage.jsx'
import EmployeesPage  from './pages/employees/EmployeesPage.jsx'
import LeavesPage     from './pages/leaves/LeavesPage.jsx'
import AIInsightsPage from './pages/ai/AIInsightsPage.jsx'
import ProfilePage    from './pages/ProfilePage.jsx'
import Layout         from './components/layout/Layout.jsx'
import PayrollPage from './PayrollPage.jsx'
import DepartmentsPage from './DepartmentsPage.jsx'
import HRVerificationPage from './pages/HRVerificationPage.jsx'

const route = createBrowserRouter([{
  path: '/',
  element: <App />,
  children: [
    { path: '/',        element: <LoginPage />    },
    { path: 'register', element: <RegisterPage /> },
    { path: 'forgot',   element: <ForgotPage />   },

    {
      element: <ProtectedRoute />,
      children: [{
        element: <Layout />,
        children: [
          { path: 'dashborad', element: <DashboardPage />  },  // kept your spelling
          { path: 'employee',  element: <EmployeesPage />  },
          { path: 'leaves',    element: <LeavesPage />     },
          { path: 'ai',        element: <AIInsightsPage /> },
          { path: 'profile',   element: <ProfilePage />    },
            { path: 'payroll',   element: <PayrollPage />    },
            { path: 'departments',   element: <DepartmentsPage />    },
            { path: 'request',   element: <HRVerificationPage />    },
        ]
      }]
    }
  ]
}])

createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <RouterProvider router={route} />
  </Provider>
)