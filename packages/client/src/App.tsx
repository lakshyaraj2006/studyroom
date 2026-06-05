import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { authRoutes } from './routes/auth.routes';
import AuthLayout from './layouts/AuthLayout';
import RootLayout from './layouts/RootLayout';
import { baseRoutes } from './routes/base.routes';
import { profileRoutes } from './routes/profile.routes';
import NotFoundPage from './pages/error/NotFound';
import { AuthProvider } from './context/AuthProvider';
import { roomRoutes } from './routes/rooms.routes';
import { NotificationProvider } from './context/NotificationProvider';

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
    path: '/rooms',
    element: <RootLayout />,
    children: roomRoutes
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
])

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <RouterProvider router={router} />
      </NotificationProvider>
    </AuthProvider>
  )
}

export default App