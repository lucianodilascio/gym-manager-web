import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// credenciales únicas del proyecto
const firebaseConfig = {
  apiKey: "AIzaSyCgvPA-3pxdqZjudkWA-0mkg6TYGXSDRhQ",
  authDomain: "gym-manager-57be7.firebaseapp.com",
  projectId: "gym-manager-57be7",
  storageBucket: "gym-manager-57be7.firebasestorage.app",
  messagingSenderId: "7847335667",
  appId: "1:7847335667:web:35bc999cc535852b9a8986"
};

// Inicializamos la aplicación
const app = initializeApp(firebaseConfig);

// Exportamos los servicios para usarlos en el resto de los componentes
export const db = getFirestore(app);
export const auth = getAuth(app);