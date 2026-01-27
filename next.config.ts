/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true, // Obligatorio para 'output: export'
  },
  // Desactivamos el trailing slash para evitar problemas con rutas en Apache/Nginx simples
  trailingSlash: true, 
};

export default nextConfig;