import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { GoogleOAuthProvider } from '@react-oauth/google'

createRoot(document.getElementById("root")!).render(
  <GoogleOAuthProvider clientId="775095815009-q4nd4nial7e3g12aa4nkmimtlsd6a8g0.apps.googleusercontent.com">
    <App />
  </GoogleOAuthProvider>
);
