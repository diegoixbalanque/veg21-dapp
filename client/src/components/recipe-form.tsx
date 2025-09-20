import { useState } from "react";
import { useWallet } from "@/hooks/use-wallet";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { communityService, CreatePostData } from "@/lib/community-service";
import { ChefHat, Lightbulb, Star, Upload, X } from "lucide-react";

interface RecipeFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

type PostType = 'recipe' | 'tip' | 'experience';

export function RecipeForm({ isOpen, onClose, onSubmit }: RecipeFormProps) {
  const { formattedAddress } = useWallet();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState<CreatePostData>({
    title: '',
    description: '',
    ingredients: '',
    preparationSteps: '',
    imageUrl: '',
    type: 'recipe'
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: keyof CreatePostData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'El título es obligatorio';
    } else if (formData.title.length < 5) {
      newErrors.title = 'El título debe tener al menos 5 caracteres';
    } else if (formData.title.length > 100) {
      newErrors.title = 'El título no puede exceder 100 caracteres';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'La descripción es obligatoria';
    } else if (formData.description.length < 10) {
      newErrors.description = 'La descripción debe tener al menos 10 caracteres';
    } else if (formData.description.length > 500) {
      newErrors.description = 'La descripción no puede exceder 500 caracteres';
    }

    // Recipe-specific validation
    if (formData.type === 'recipe') {
      if (!formData.ingredients?.trim()) {
        newErrors.ingredients = 'Los ingredientes son obligatorios para recetas';
      }
      if (!formData.preparationSteps?.trim()) {
        newErrors.preparationSteps = 'Los pasos de preparación son obligatorios para recetas';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm() || !formattedAddress) return;

    setIsSubmitting(true);
    
    try {
      // Get username from localStorage (same pattern as profile page)
      const storedUsername = localStorage.getItem('veg21_username');
      const authorName = storedUsername || `User_${formattedAddress.slice(-4)}`;

      communityService.createPost(
        formattedAddress,
        authorName,
        formData
      );

      toast({
        title: "¡Post publicado! 🌱",
        description: `Tu ${
          formData.type === 'recipe' ? 'receta' : 
          formData.type === 'tip' ? 'consejo' : 
          'experiencia'
        } ha sido compartida con la comunidad.`,
        duration: 4000,
      });

      // Reset form
      setFormData({
        title: '',
        description: '',
        ingredients: '',
        preparationSteps: '',
        imageUrl: '',
        type: 'recipe'
      });
      
      onSubmit();
    } catch (error) {
      console.error('Failed to create post:', error);
      toast({
        title: "Error al publicar",
        description: "No se pudo publicar tu post. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  const getPostTypeInfo = (type: PostType) => {
    switch (type) {
      case 'recipe':
        return {
          icon: <ChefHat className="w-5 h-5" />,
          title: 'Receta Vegana',
          description: 'Comparte una deliciosa receta vegana con la comunidad',
          color: 'text-green-600'
        };
      case 'tip':
        return {
          icon: <Lightbulb className="w-5 h-5" />,
          title: 'Consejo Vegano',
          description: 'Comparte un consejo útil sobre el estilo de vida vegano',
          color: 'text-blue-600'
        };
      case 'experience':
        return {
          icon: <Star className="w-5 h-5" />,
          title: 'Experiencia Personal',
          description: 'Comparte tu experiencia en el camino vegano',
          color: 'text-purple-600'
        };
    }
  };

  const currentTypeInfo = getPostTypeInfo(formData.type);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="modal-recipe-form">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <span className={currentTypeInfo.color}>{currentTypeInfo.icon}</span>
            <span>Compartir {currentTypeInfo.title}</span>
          </DialogTitle>
          <DialogDescription>
            {currentTypeInfo.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Post Type Selection */}
          <div className="space-y-2">
            <Label htmlFor="postType">Tipo de contenido</Label>
            <Select
              value={formData.type}
              onValueChange={(value: PostType) => handleInputChange('type', value)}
              data-testid="select-post-type"
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona el tipo de contenido" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recipe" data-testid="option-recipe">
                  <div className="flex items-center space-x-2">
                    <ChefHat className="w-4 h-4" />
                    <span>Receta Vegana</span>
                  </div>
                </SelectItem>
                <SelectItem value="tip" data-testid="option-tip">
                  <div className="flex items-center space-x-2">
                    <Lightbulb className="w-4 h-4" />
                    <span>Consejo</span>
                  </div>
                </SelectItem>
                <SelectItem value="experience" data-testid="option-experience">
                  <div className="flex items-center space-x-2">
                    <Star className="w-4 h-4" />
                    <span>Experiencia</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">
              Título <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder={
                formData.type === 'recipe' ? 'Ej: Tacos veganos de jackfruit' :
                formData.type === 'tip' ? 'Ej: Cómo obtener proteína completa' :
                'Ej: Mi primer mes siendo vegano'
              }
              className={errors.title ? 'border-red-500' : ''}
              data-testid="input-title"
            />
            {errors.title && (
              <p className="text-red-500 text-sm" data-testid="error-title">{errors.title}</p>
            )}
            <p className="text-gray-500 text-xs">
              {formData.title.length}/100 caracteres
            </p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">
              Descripción <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder={
                formData.type === 'recipe' ? 'Describe tu receta y por qué la recomiendas...' :
                formData.type === 'tip' ? 'Explica tu consejo y cómo puede ayudar...' :
                'Comparte tu experiencia y lo que has aprendido...'
              }
              rows={4}
              className={errors.description ? 'border-red-500' : ''}
              data-testid="textarea-description"
            />
            {errors.description && (
              <p className="text-red-500 text-sm" data-testid="error-description">{errors.description}</p>
            )}
            <p className="text-gray-500 text-xs">
              {formData.description.length}/500 caracteres
            </p>
          </div>

          {/* Recipe-specific fields */}
          {formData.type === 'recipe' && (
            <Card className="bg-green-50 border-green-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-green-800 text-lg">Detalles de la Receta</CardTitle>
                <CardDescription className="text-green-700">
                  Completa los ingredientes y pasos de preparación
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Ingredients */}
                <div className="space-y-2">
                  <Label htmlFor="ingredients">
                    Ingredientes <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="ingredients"
                    value={formData.ingredients || ''}
                    onChange={(e) => handleInputChange('ingredients', e.target.value)}
                    placeholder="- 2 tazas de arroz integral&#10;- 1 lata de frijoles negros&#10;- 1 aguacate maduro&#10;- ..."
                    rows={6}
                    className={errors.ingredients ? 'border-red-500' : ''}
                    data-testid="textarea-ingredients"
                  />
                  {errors.ingredients && (
                    <p className="text-red-500 text-sm" data-testid="error-ingredients">{errors.ingredients}</p>
                  )}
                  <p className="text-gray-500 text-xs">
                    Usa una línea por ingrediente. Incluye cantidades cuando sea posible.
                  </p>
                </div>

                {/* Preparation Steps */}
                <div className="space-y-2">
                  <Label htmlFor="preparationSteps">
                    Pasos de Preparación <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="preparationSteps"
                    value={formData.preparationSteps || ''}
                    onChange={(e) => handleInputChange('preparationSteps', e.target.value)}
                    placeholder="1. Lava y cocina el arroz según las instrucciones&#10;2. Escurre y enjuaga los frijoles&#10;3. ..."
                    rows={8}
                    className={errors.preparationSteps ? 'border-red-500' : ''}
                    data-testid="textarea-steps"
                  />
                  {errors.preparationSteps && (
                    <p className="text-red-500 text-sm" data-testid="error-steps">{errors.preparationSteps}</p>
                  )}
                  <p className="text-gray-500 text-xs">
                    Enumera los pasos claramente. Sé específico con tiempos y temperaturas.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Mock Image Upload */}
          <div className="space-y-2">
            <Label htmlFor="imageUrl">Imagen (opcional)</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center bg-gray-50">
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600 text-sm mb-3">
                Funcionalidad de carga de imagen (simulada)
              </p>
              <Input
                id="imageUrl"
                value={formData.imageUrl || ''}
                onChange={(e) => handleInputChange('imageUrl', e.target.value)}
                placeholder="Ej: mi-receta-vegana.jpg"
                className="max-w-xs mx-auto"
                data-testid="input-image-url"
              />
              <p className="text-gray-500 text-xs mt-2">
                Por ahora, ingresa un nombre de archivo para simular la carga
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              data-testid="button-cancel"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !formData.title || !formData.description}
              className="bg-gradient-to-r from-veg-primary to-veg-secondary text-white hover:from-veg-secondary hover:to-veg-primary"
              data-testid="button-submit"
            >
              {isSubmitting ? 'Publicando...' : 'Publicar'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}