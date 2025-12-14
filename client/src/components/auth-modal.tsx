import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Leaf, Mail, Lock, User, MapPin, Loader2 } from "lucide-react";
import { SiGoogle, SiFacebook } from "react-icons/si";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: "login" | "register";
}

export function AuthModal({ isOpen, onClose, defaultTab = "login" }: AuthModalProps) {
  const { login, register } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(defaultTab);

  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    location: "",
    dietaryPreference: ""
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    if (!loginData.email || !loginData.password) {
      setErrors({ general: "Por favor completa todos los campos" });
      return;
    }
    
    setIsLoading(true);
    try {
      await login(loginData.email, loginData.password);
      toast({
        title: "¡Bienvenido de vuelta! 🌱",
        description: "Has iniciado sesión correctamente.",
      });
      onClose();
    } catch (error: any) {
      setErrors({ general: error.message || "Error al iniciar sesión" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    const newErrors: Record<string, string> = {};
    
    if (!registerData.name.trim()) newErrors.name = "El nombre es requerido";
    if (!registerData.email.trim()) newErrors.email = "El email es requerido";
    if (!registerData.password) newErrors.password = "La contraseña es requerida";
    if (registerData.password.length < 6) newErrors.password = "Mínimo 6 caracteres";
    if (registerData.password !== registerData.confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden";
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setIsLoading(true);
    try {
      await register({
        email: registerData.email,
        password: registerData.password,
        name: registerData.name,
        location: registerData.location || undefined,
        dietaryPreference: registerData.dietaryPreference || undefined
      });
      toast({
        title: "¡Cuenta creada! 🎉",
        description: "Bienvenido a VEG21. ¡Comienza tu desafío!",
      });
      onClose();
    } catch (error: any) {
      setErrors({ general: error.message || "Error al crear cuenta" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]" data-testid="dialog-auth">
        <DialogHeader>
          <div className="flex items-center justify-center mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-veg-primary to-veg-secondary rounded-xl flex items-center justify-center">
              <Leaf className="text-white w-6 h-6" />
            </div>
          </div>
          <DialogTitle className="text-center text-xl">VEG21</DialogTitle>
          <DialogDescription className="text-center">
            Tu plataforma de desafíos veganos
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "login" | "register")} className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login" data-testid="tab-login">Iniciar Sesión</TabsTrigger>
            <TabsTrigger value="register" data-testid="tab-register">Registrarse</TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="space-y-4 mt-4">
            <div className="space-y-3">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => window.location.href = '/api/auth/google'}
                data-testid="button-google-login"
              >
                <SiGoogle className="mr-2 h-4 w-4 text-red-500" />
                Continuar con Google
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => window.location.href = '/api/auth/facebook'}
                data-testid="button-facebook-login"
              >
                <SiFacebook className="mr-2 h-4 w-4 text-blue-600" />
                Continuar con Facebook
              </Button>
            </div>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  O continúa con email
                </span>
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              {errors.general && (
                <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg" data-testid="error-general">
                  {errors.general}
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="tu@email.com"
                    className="pl-10"
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    data-testid="input-login-email"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="login-password">Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    data-testid="input-login-password"
                  />
                </div>
              </div>
              
              <Button type="submit" className="w-full bg-veg-primary hover:bg-veg-primary/90" disabled={isLoading} data-testid="button-login">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Iniciando...
                  </>
                ) : (
                  "Iniciar Sesión"
                )}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="register" className="space-y-4 mt-4">
            <div className="space-y-3">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => window.location.href = '/api/auth/google'}
                data-testid="button-google-register"
              >
                <SiGoogle className="mr-2 h-4 w-4 text-red-500" />
                Continuar con Google
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => window.location.href = '/api/auth/facebook'}
                data-testid="button-facebook-register"
              >
                <SiFacebook className="mr-2 h-4 w-4 text-blue-600" />
                Continuar con Facebook
              </Button>
            </div>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  O regístrate con email
                </span>
              </div>
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
              {errors.general && (
                <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg" data-testid="error-register-general">
                  {errors.general}
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="register-name">Nombre *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="register-name"
                    placeholder="Tu nombre"
                    className="pl-10"
                    value={registerData.name}
                    onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                    data-testid="input-register-name"
                  />
                </div>
                {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="register-email">Email *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="register-email"
                    type="email"
                    placeholder="tu@email.com"
                    className="pl-10"
                    value={registerData.email}
                    onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                    data-testid="input-register-email"
                  />
                </div>
                {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="register-password">Contraseña *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="register-password"
                      type="password"
                      placeholder="••••••"
                      className="pl-10"
                      value={registerData.password}
                      onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                      data-testid="input-register-password"
                    />
                  </div>
                  {errors.password && <p className="text-sm text-red-600">{errors.password}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="register-confirm">Confirmar *</Label>
                  <Input
                    id="register-confirm"
                    type="password"
                    placeholder="••••••"
                    value={registerData.confirmPassword}
                    onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                    data-testid="input-register-confirm"
                  />
                  {errors.confirmPassword && <p className="text-sm text-red-600">{errors.confirmPassword}</p>}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="register-location">Ubicación</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="register-location"
                    placeholder="Tu ciudad"
                    className="pl-10"
                    value={registerData.location}
                    onChange={(e) => setRegisterData({ ...registerData, location: e.target.value })}
                    data-testid="input-register-location"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="register-diet">Preferencia dietética</Label>
                <Select
                  value={registerData.dietaryPreference}
                  onValueChange={(v) => setRegisterData({ ...registerData, dietaryPreference: v })}
                >
                  <SelectTrigger data-testid="select-dietary-preference">
                    <SelectValue placeholder="Selecciona una opción" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="omnivore">Omnívoro</SelectItem>
                    <SelectItem value="vegetarian">Vegetariano</SelectItem>
                    <SelectItem value="vegan">Vegano</SelectItem>
                    <SelectItem value="curious">Curioso</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button type="submit" className="w-full bg-veg-primary hover:bg-veg-primary/90" disabled={isLoading} data-testid="button-register">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creando cuenta...
                  </>
                ) : (
                  "Crear Cuenta"
                )}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
