import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { GoogleOAuthProvider } from '@react-oauth/google'

createRoot(document.getElementById("root")!).render(
  <GoogleOAuthProvider clientId="947647702988-24pklfpf01j1ov3n1hiusd93ehkr454a.apps.googleusercontent.com">
    <App />
  </GoogleOAuthProvider>
);
