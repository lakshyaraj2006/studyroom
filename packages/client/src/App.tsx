import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { authRoutes } from './routes/auth.routes';
import AuthLayout from './layouts/AuthLayout';
import RootLayout from './layouts/RootLayout';
import { baseRoutes } from './routes/base.routes';
import { profileRoutes } from './routes/profile.routes';
import NotFoundPage from './pages/error/NotFound';
import { AuthProvider } from './context/AuthProvider';

const router = createBrowserRouter([
  {
    path: '/auth',
    element: <AuthLayout />,
    children: authRoutes
  },
  {
    path: '/',
    element: <RootLayout />,
    children: baseRoutes
  },
  {
    path: '/profile',
    element: <RootLayout />,
    children: profileRoutes
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
])

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  )
}

export default App