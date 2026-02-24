# React + Vite

<!-- even after deletiing the image from cloudinary i am still able to see in user profile 

Database Reference: When you delete an image manually from the Cloudinary dashboard, your MongoDB database (User collection) is not aware of this change. It still stores the old URL string (e.g., https://res.cloudinary.com/.../image.jpg) in the avatar field. Your frontend fetches this URL and tries to display it.
Browser Caching: Your web browser (Chrome, Firefox, etc.) saves images locally to load pages faster. Even if the image is gone from the server, your browser is likely serving the copy it saved previously.
Cloudinary CDN: Cloudinary uses a Content Delivery Network. When you delete an image, it may remain on their "Edge Servers" around the world for a short period (from minutes to hours) until the cache expires.

 -->


This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
