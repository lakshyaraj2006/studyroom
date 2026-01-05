import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { authRoutes } from './routes/auth.routes';
import AuthLayout from './layouts/AuthLayout';

const router = createBrowserRouter([
  {
    path: '/auth',
    element: <AuthLayout />,
    children: authRoutes
  }
])

function App() {
  return <RouterProvider router={router} />
}

export default App