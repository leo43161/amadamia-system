/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true, // Obligatorio para 'output: export'
  },
  env: {
    URL_SERVER: process.env.NODE_ENV === 'production' ? "" : "http://192.168.100.41/amada_api",
  },
  // Desactivamos el trailing slash para evitar problemas con rutas en Apache/Nginx simples
  trailingSlash: true, 
};

export default nextConfig;