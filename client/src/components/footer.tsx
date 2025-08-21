import { Leaf } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-veg-dark text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-veg-primary to-veg-secondary rounded-xl flex items-center justify-center">
                <Leaf className="text-white text-lg" />
              </div>
              <h3 className="text-xl font-bold">VEG21</h3>
            </div>
            <p className="text-gray-300 leading-relaxed">
              Revolucionando los hábitos veganos a través de blockchain y construyendo un futuro más sostenible para todos.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Plataforma</h4>
            <ul className="space-y-2 text-gray-300">
              <li><a href="#" className="hover:text-veg-primary transition-colors">Retos Activos</a></li>
              <li><a href="#" className="hover:text-veg-primary transition-colors">Fondo Comunitario</a></li>
              <li><a href="#" className="hover:text-veg-primary transition-colors">Ranking</a></li>
              <li><a href="#" className="hover:text-veg-primary transition-colors">Tokenomics</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Recursos</h4>
            <ul className="space-y-2 text-gray-300">
              <li><a href="#" className="hover:text-veg-primary transition-colors">Guía Vegana</a></li>
              <li><a href="#" className="hover:text-veg-primary transition-colors">Documentación</a></li>
              <li><a href="#" className="hover:text-veg-primary transition-colors">API</a></li>
              <li><a href="#" className="hover:text-veg-primary transition-colors">Soporte</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Comunidad</h4>
            <div className="flex space-x-4 mb-4">
              <a href="#" className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center hover:bg-veg-primary transition-colors">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#" className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center hover:bg-veg-primary transition-colors">
                <i className="fab fa-discord"></i>
              </a>
              <a href="#" className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center hover:bg-veg-primary transition-colors">
                <i className="fab fa-telegram"></i>
              </a>
            </div>
            <p className="text-gray-300 text-sm">
              Únete a nuestra comunidad global de más de 10,000 veganos comprometidos.
            </p>
          </div>
        </div>
        
        <div className="border-t border-gray-700 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2024 VEG21. Todos los derechos reservados. | Desarrollado en Astar Network
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-gray-400 hover:text-veg-primary text-sm transition-colors">Términos</a>
            <a href="#" className="text-gray-400 hover:text-veg-primary text-sm transition-colors">Privacidad</a>
            <a href="#" className="text-gray-400 hover:text-veg-primary text-sm transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
