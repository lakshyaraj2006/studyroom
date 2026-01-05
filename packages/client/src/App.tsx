import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { authRoutes } from './routes/auth.routes';

const router = createBrowserRouter([
  {
    path: '/auth',
    children: authRoutes
  }
])

function App() {
  return <RouterProvider router={router} />
}

export default App