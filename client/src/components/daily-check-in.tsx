import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useWallet } from "@/hooks/use-wallet";
import { useToast } from "@/hooks/use-toast";
import { 
  Camera, 
  Upload, 
  X, 
  Heart, 
  MessageCircle, 
  ThumbsUp,
  CheckCircle2,
  Calendar,
  Image as ImageIcon,
  Video,
  Users
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

export interface DailyCheckIn {
  id: string;
  day: number;
  userId: string;
  username: string;
  description: string;
  imageUrl?: string;
  timestamp: string;
  likes: number;
  likedBy: string[];
  approvals: number;
  approvedBy: string[];
  comments: CheckInComment[];
}

export interface CheckInComment {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  timestamp: string;
}

interface DailyCheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  day: number;
  onCheckInComplete: (checkIn: DailyCheckIn) => void;
}

const CHECKINS_STORAGE_KEY = 'veg21_daily_checkins';

export function DailyCheckInModal({ isOpen, onClose, day, onCheckInComplete }: DailyCheckInModalProps) {
  const { formattedAddress } = useWallet();
  const { toast } = useToast();
  
  const [description, setDescription] = useState('');
  const [mockImageUrl, setMockImageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadType, setUploadType] = useState<'photo' | 'video' | null>(null);

  const handleMockUpload = (type: 'photo' | 'video') => {
    setUploadType(type);
    // Simulate image upload with a placeholder
    const placeholderImages = [
      'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800',
      'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800',
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800',
      'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800',
      'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800'
    ];
    const randomImage = placeholderImages[Math.floor(Math.random() * placeholderImages.length)];
    setMockImageUrl(randomImage);
    
    toast({
      title: `${type === 'photo' ? 'Foto' : 'Video'} cargada`,
      description: `Tu ${type === 'photo' ? 'foto' : 'video'} se ha cargado exitosamente (simulado)`,
    });
  };

  const handleRemoveImage = () => {
    setMockImageUrl('');
    setUploadType(null);
  };

  const handleSubmit = () => {
    if (!description.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Por favor describe tu progreso del día",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const checkIn: DailyCheckIn = {
        id: `checkin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        day,
        userId: formattedAddress || 'anonymous',
        username: localStorage.getItem('veg21_username') || `Usuario ${formattedAddress?.slice(-4) || '????'}`,
        description,
        imageUrl: mockImageUrl || undefined,
        timestamp: new Date().toISOString(),
        likes: 0,
        likedBy: [],
        approvals: 0,
        approvedBy: [],
        comments: []
      };

      // Save to localStorage
      const stored = localStorage.getItem(CHECKINS_STORAGE_KEY);
      const checkIns: DailyCheckIn[] = stored ? JSON.parse(stored) : [];
      checkIns.push(checkIn);
      localStorage.setItem(CHECKINS_STORAGE_KEY, JSON.stringify(checkIns));

      onCheckInComplete(checkIn);
      
      toast({
        title: "¡Check-in registrado! 🎉",
        description: `Has completado el día ${day} de tu desafío vegano`,
      });

      // Reset form
      setDescription('');
      setMockImageUrl('');
      setUploadType(null);
      onClose();
    } catch (error) {
      console.error('Failed to submit check-in:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo registrar tu check-in. Inténtalo de nuevo.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="modal-daily-checkin">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center text-veg-primary flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6 mr-2" />
            Check-in Día {day}
          </DialogTitle>
          <DialogDescription className="text-center text-gray-600">
            Comparte tu progreso con la comunidad
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="bg-gradient-to-r from-veg-primary/5 to-veg-secondary/5 p-4 rounded-lg border border-veg-primary/20">
            <p className="text-sm text-gray-700">
              <strong>💡 Tip:</strong> Comparte una foto de tu comida vegana, describe lo que preparaste,
              o cuéntanos cómo te sientes en este desafío.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="description" className="text-base font-semibold">
                Describe tu día vegano *
              </Label>
              <Textarea
                id="description"
                data-testid="textarea-checkin-description"
                placeholder="Ej: Hoy preparé una deliciosa pasta con pesto de espinacas. Me sentí con mucha energía y descubrí que cocinar vegano puede ser muy creativo..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-2 min-h-[120px]"
              />
              <p className="text-sm text-gray-500 mt-1">
                {description.length}/500 caracteres
              </p>
            </div>

            <div className="space-y-3">
              <Label className="text-base font-semibold">
                Sube una prueba (opcional)
              </Label>
              
              {!mockImageUrl ? (
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleMockUpload('photo')}
                    className="h-24 flex flex-col items-center justify-center space-y-2 hover:bg-veg-primary/5 hover:border-veg-primary"
                    data-testid="button-upload-photo"
                  >
                    <Camera className="w-8 h-8 text-veg-primary" />
                    <span className="text-sm font-medium">Subir Foto</span>
                  </Button>
                  
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleMockUpload('video')}
                    className="h-24 flex flex-col items-center justify-center space-y-2 hover:bg-veg-primary/5 hover:border-veg-primary"
                    data-testid="button-upload-video"
                  >
                    <Video className="w-8 h-8 text-veg-primary" />
                    <span className="text-sm font-medium">Subir Video</span>
                  </Button>
                </div>
              ) : (
                <div className="relative border-2 border-veg-primary/30 rounded-lg overflow-hidden">
                  <img 
                    src={mockImageUrl} 
                    alt="Check-in preview" 
                    className="w-full h-64 object-cover"
                  />
                  <div className="absolute top-2 right-2 flex items-center space-x-2">
                    <Badge className="bg-white/90 text-veg-primary">
                      {uploadType === 'photo' ? <ImageIcon className="w-3 h-3 mr-1" /> : <Video className="w-3 h-3 mr-1" />}
                      {uploadType === 'photo' ? 'Foto' : 'Video'}
                    </Badge>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={handleRemoveImage}
                      className="h-8 w-8 p-0"
                      data-testid="button-remove-image"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                    <p className="text-xs text-white">
                      Vista previa de tu {uploadType === 'photo' ? 'foto' : 'video'}
                    </p>
                  </div>
                </div>
              )}
              
              <p className="text-xs text-gray-500">
                <Upload className="w-3 h-3 inline mr-1" />
                Modo simulado: Las imágenes se cargan de forma ficticia para demostración
              </p>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-900 flex items-center mb-2">
              <Users className="w-4 h-4 mr-2" />
              Validación Comunitaria
            </h4>
            <p className="text-sm text-blue-800">
              Una vez enviado, otros miembros de la comunidad podrán validar tu progreso 
              dando "me gusta" o aprobaciones. ¡Gana credibilidad y tokens extra con la comunidad!
            </p>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              data-testid="button-cancel-checkin"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !description.trim()}
              className="bg-gradient-to-r from-veg-primary to-veg-secondary text-white hover:from-veg-secondary hover:to-veg-primary"
              data-testid="button-submit-checkin"
            >
              {isSubmitting ? 'Guardando...' : '✓ Registrar Check-in'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Utility functions for check-ins
export function getAllCheckIns(): DailyCheckIn[] {
  try {
    const stored = localStorage.getItem(CHECKINS_STORAGE_KEY);
    if (!stored) return [];
    
    const checkIns: DailyCheckIn[] = JSON.parse(stored);
    return checkIns.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  } catch (error) {
    console.error('Failed to get check-ins:', error);
    return [];
  }
}

export function getUserCheckIns(userId: string): DailyCheckIn[] {
  try {
    const allCheckIns = getAllCheckIns();
    return allCheckIns.filter(checkIn => checkIn.userId === userId);
  } catch (error) {
    console.error('Failed to get user check-ins:', error);
    return [];
  }
}

export function likeCheckIn(checkInId: string, userId: string): boolean {
  try {
    const stored = localStorage.getItem(CHECKINS_STORAGE_KEY);
    if (!stored) return false;
    
    const checkIns: DailyCheckIn[] = JSON.parse(stored);
    const checkIn = checkIns.find(c => c.id === checkInId);
    
    if (!checkIn) return false;
    
    if (checkIn.likedBy.includes(userId)) {
      // Unlike
      checkIn.likedBy = checkIn.likedBy.filter(id => id !== userId);
      checkIn.likes = checkIn.likedBy.length;
    } else {
      // Like
      checkIn.likedBy.push(userId);
      checkIn.likes = checkIn.likedBy.length;
    }
    
    localStorage.setItem(CHECKINS_STORAGE_KEY, JSON.stringify(checkIns));
    return true;
  } catch (error) {
    console.error('Failed to like check-in:', error);
    return false;
  }
}

export function approveCheckIn(checkInId: string, userId: string): boolean {
  try {
    const stored = localStorage.getItem(CHECKINS_STORAGE_KEY);
    if (!stored) return false;
    
    const checkIns: DailyCheckIn[] = JSON.parse(stored);
    const checkIn = checkIns.find(c => c.id === checkInId);
    
    if (!checkIn) return false;
    
    if (checkIn.approvedBy.includes(userId)) {
      // Un-approve
      checkIn.approvedBy = checkIn.approvedBy.filter(id => id !== userId);
      checkIn.approvals = checkIn.approvedBy.length;
    } else {
      // Approve
      checkIn.approvedBy.push(userId);
      checkIn.approvals = checkIn.approvedBy.length;
    }
    
    localStorage.setItem(CHECKINS_STORAGE_KEY, JSON.stringify(checkIns));
    return true;
  } catch (error) {
    console.error('Failed to approve check-in:', error);
    return false;
  }
}

export function addCheckInComment(checkInId: string, authorId: string, authorName: string, content: string): boolean {
  try {
    const stored = localStorage.getItem(CHECKINS_STORAGE_KEY);
    if (!stored) return false;
    
    const checkIns: DailyCheckIn[] = JSON.parse(stored);
    const checkIn = checkIns.find(c => c.id === checkInId);
    
    if (!checkIn) return false;
    
    const comment: CheckInComment = {
      id: `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      authorId,
      authorName,
      content,
      timestamp: new Date().toISOString()
    };
    
    checkIn.comments.push(comment);
    
    localStorage.setItem(CHECKINS_STORAGE_KEY, JSON.stringify(checkIns));
    return true;
  } catch (error) {
    console.error('Failed to add comment:', error);
    return false;
  }
}

// Component to display check-ins
interface CheckInListProps {
  checkIns: DailyCheckIn[];
  currentUserId: string;
  onLike: (checkInId: string) => void;
  onApprove: (checkInId: string) => void;
}

export function CheckInList({ checkIns, currentUserId, onLike, onApprove }: CheckInListProps) {
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});

  const handleAddComment = (checkInId: string) => {
    const content = commentInputs[checkInId]?.trim();
    if (!content) return;

    const username = localStorage.getItem('veg21_username') || `Usuario ${currentUserId?.slice(-4) || '????'}`;
    addCheckInComment(checkInId, currentUserId, username, content);
    
    setCommentInputs(prev => ({ ...prev, [checkInId]: '' }));
  };

  if (checkIns.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <CheckCircle2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">Aún no hay check-ins para mostrar</p>
          <p className="text-sm text-gray-500 mt-2">
            Sé el primero en registrar tu progreso diario
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {checkIns.map((checkIn) => {
        const isCurrentUser = checkIn.userId === currentUserId;
        const hasLiked = checkIn.likedBy.includes(currentUserId);
        const hasApproved = checkIn.approvedBy.includes(currentUserId);

        return (
          <Card key={checkIn.id} className="overflow-hidden" data-testid={`checkin-card-${checkIn.id}`}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarFallback className="bg-gradient-to-br from-veg-primary to-veg-secondary text-white">
                      {checkIn.username.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold flex items-center">
                      {checkIn.username}
                      {isCurrentUser && (
                        <Badge variant="secondary" className="ml-2 text-xs">
                          Tú
                        </Badge>
                      )}
                    </p>
                    <p className="text-sm text-gray-500">
                      Día {checkIn.day} • {formatDistanceToNow(new Date(checkIn.timestamp), { addSuffix: true, locale: es })}
                    </p>
                  </div>
                </div>
                <Badge className="bg-veg-primary/10 text-veg-primary">
                  <Calendar className="w-3 h-3 mr-1" />
                  Día {checkIn.day}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              <p className="text-gray-700 whitespace-pre-wrap">{checkIn.description}</p>

              {checkIn.imageUrl && (
                <div className="rounded-lg overflow-hidden border border-gray-200">
                  <img 
                    src={checkIn.imageUrl} 
                    alt={`Check-in día ${checkIn.day}`}
                    className="w-full h-64 object-cover"
                  />
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div className="flex items-center space-x-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onLike(checkIn.id)}
                    className={hasLiked ? 'text-red-600' : 'text-gray-600'}
                    data-testid={`button-like-${checkIn.id}`}
                  >
                    <Heart className={`w-4 h-4 mr-1 ${hasLiked ? 'fill-current' : ''}`} />
                    {checkIn.likes}
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onApprove(checkIn.id)}
                    className={hasApproved ? 'text-green-600' : 'text-gray-600'}
                    data-testid={`button-approve-${checkIn.id}`}
                  >
                    <ThumbsUp className={`w-4 h-4 mr-1 ${hasApproved ? 'fill-current' : ''}`} />
                    {checkIn.approvals} Validaciones
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setExpandedComments(prev => ({ ...prev, [checkIn.id]: !prev[checkIn.id] }))}
                    className="text-gray-600"
                    data-testid={`button-comments-${checkIn.id}`}
                  >
                    <MessageCircle className="w-4 h-4 mr-1" />
                    {checkIn.comments.length}
                  </Button>
                </div>
              </div>

              {expandedComments[checkIn.id] && (
                <div className="space-y-3 pt-3 border-t border-gray-100">
                  {checkIn.comments.map((comment) => (
                    <div key={comment.id} className="flex items-start space-x-2">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-gray-200 text-gray-600 text-xs">
                          {comment.authorName.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 bg-gray-50 rounded-lg p-2">
                        <p className="text-sm font-semibold text-gray-900">{comment.authorName}</p>
                        <p className="text-sm text-gray-700">{comment.content}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDistanceToNow(new Date(comment.timestamp), { addSuffix: true, locale: es })}
                        </p>
                      </div>
                    </div>
                  ))}

                  <div className="flex items-center space-x-2">
                    <Input
                      placeholder="Escribe un comentario..."
                      value={commentInputs[checkIn.id] || ''}
                      onChange={(e) => setCommentInputs(prev => ({ ...prev, [checkIn.id]: e.target.value }))}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddComment(checkIn.id)}
                      data-testid={`input-comment-${checkIn.id}`}
                    />
                    <Button
                      size="sm"
                      onClick={() => handleAddComment(checkIn.id)}
                      disabled={!commentInputs[checkIn.id]?.trim()}
                      data-testid={`button-send-comment-${checkIn.id}`}
                    >
                      Enviar
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
