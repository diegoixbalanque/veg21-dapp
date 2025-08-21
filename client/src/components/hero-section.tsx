import { Users, Leaf } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative py-20 px-4 sm:px-6 lg:px-8">
      <div className="absolute inset-0 bg-gradient-to-r from-green-900/20 to-emerald-900/20"></div>
      <div className="relative max-w-7xl mx-auto text-center">
        <div className="animate-fade-in">
          <h1 className="text-5xl md:text-7xl font-bold text-veg-dark mb-6 leading-tight">
            VEG21
            <span className="block text-veg-primary">21 Días de Hábitos</span>
            <span className="block text-veg-secondary">Veganos</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Únete a la revolución verde en blockchain. Construye hábitos veganos sostenibles mientras contribuyes al bienestar animal y ganas recompensas en tokens.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-green-100">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-veg-accent/20 rounded-full flex items-center justify-center">
                  <Users className="text-veg-accent text-xl" />
                </div>
                <div className="text-left">
                  <p className="text-2xl font-bold text-veg-dark">1,247</p>
                  <p className="text-sm text-gray-600">Participantes Activos</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-green-100">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-veg-primary/20 rounded-full flex items-center justify-center">
                  <Leaf className="text-veg-primary text-xl" />
                </div>
                <div className="text-left">
                  <p className="text-2xl font-bold text-veg-dark">8,943</p>
                  <p className="text-sm text-gray-600">kg CO₂ Ahorrados</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
