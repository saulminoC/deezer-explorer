# 🎵 Deezer Explorer

> Un clon moderno de reproductor de música construido con **React** y la **API de Deezer**.

![Project Screenshot](https://via.placeholder.com/800x400?text=Agrega+una+Captura+de+Pantalla+Aqui)
*(Te recomiendo subir una captura de tu proyecto a la carpeta `/public` y cambiar este link)*

## 🚀 Demo en Vivo
Puedes probar la aplicación funcionando aquí:
👉 **[Link a tu proyecto en Vercel (ej: deezer-explorer.vercel.app)](https://vercel.com)**

---

## 📖 Descripción
**Deezer Explorer** es una aplicación web de tipo SPA (Single Page Application) que permite a los usuarios buscar artistas, explorar discografías y reproducir previsualizaciones de música en tiempo real.

El objetivo del proyecto fue construir una interfaz de usuario **"Pixel Perfect"** similar a Spotify o Apple Music, resolviendo retos técnicos como el consumo de APIs externas, manejo de audio en el navegador y diseño responsivo moderno (Dark Mode).

## ✨ Funcionalidades Clave
* **Buscador en Tiempo Real:** Conexión directa a la base de datos de Deezer.
* **Reproductor de Audio Custom:** Control total del elemento `<audio>` mediante React Refs (Play, Pause, Progress).
* **Interfaz Moderna (Dark Mode):** Diseño basado en CSS Variables, Grid Layout y Flexbox.
* **Hero Profile:** Visualización de artistas con cabeceras inmersivas y datos reales (Fans, Discografía).
* **Top Tracks:** Lista de canciones más populares con funcionalidad de "Click-to-Play".
* **Sin Backend:** Arquitectura Serverless utilizando un Proxy CORS para peticiones seguras desde el cliente.

## 🛠️ Stack Tecnológico

* **Frontend:** React 18 (Hooks: `useState`, `useEffect`, `useRef`).
* **Build Tool:** Vite (Carga ultra rápida).
* **Estilos:** CSS3 Moderno (Variables, Glassmorphism).
* **Iconos:** React Icons (`react-icons/fi`).
* **API:** [Deezer Public API](https://developers.deezer.com/api).
* **Proxy:** CORS Proxy IO (Para evitar bloqueos de origen cruzado).
* **Deployment:** Vercel.

## ⚙️ Instalación Local

Si quieres correr este proyecto en tu máquina:

1.  **Clonar el repositorio**
    ```bash
    git clone [https://github.com/TU_USUARIO/deezer-explorer.git](https://github.com/TU_USUARIO/deezer-explorer.git)
    cd deezer-explorer
    ```

2.  **Instalar dependencias**
    ```bash
    npm install
    ```

3.  **Iniciar servidor de desarrollo**
    ```bash
    npm run dev
    ```

4.  Abrir `http://localhost:5173` en tu navegador.

## 📂 Estructura del Proyecto

```text
/src
 ├── /assets          # Recursos estáticos
 ├── App.jsx          # Lógica principal y enrutamiento
 ├── App.css          # Sistema de diseño (Variables CSS y Layout)
 ├── main.jsx         # Punto de entrada
 └── index.css        # Reset global