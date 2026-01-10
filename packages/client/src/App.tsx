import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { authRoutes } from './routes/auth.routes';
import AuthLayout from './layouts/AuthLayout';
import RootLayout from './layouts/RootLayout';
import { baseRoutes } from './routes/base.routes';

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
  }
])

function App() {
  return <RouterProvider router={router} />
}

export default App