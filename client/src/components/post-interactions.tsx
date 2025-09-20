import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { communityService, CommunityPost, Comment } from "@/lib/community-service";
import { Heart, MessageCircle, Send, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

interface PostInteractionsProps {
  post: CommunityPost;
  currentUserId: string;
  onInteraction: () => void;
}

export function PostInteractions({ post, currentUserId, onInteraction }: PostInteractionsProps) {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const hasLiked = communityService.hasUserLiked(post.id);

  const handleLike = () => {
    if (!currentUserId) return;
    
    communityService.toggleLike(post.id, currentUserId);
    onInteraction(); // Trigger parent refresh
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !currentUserId || isSubmittingComment) return;

    setIsSubmittingComment(true);

    try {
      // Get username from localStorage (same pattern as other components)
      const storedUsername = localStorage.getItem('veg21_username');
      const authorName = storedUsername || `User_${currentUserId.slice(-4)}`;

      communityService.addComment(
        post.id,
        currentUserId,
        authorName,
        newComment.trim()
      );

      setNewComment('');
      onInteraction(); // Trigger parent refresh
    } catch (error) {
      console.error('Failed to add comment:', error);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const formatRelativeTime = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { 
        addSuffix: true, 
        locale: es 
      });
    } catch (error) {
      return 'hace un momento';
    }
  };

  const generateAvatar = (userId: string): string => {
    const colors = [
      'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-purple-500', 
      'bg-pink-500', 'bg-indigo-500', 'bg-yellow-500', 'bg-teal-500'
    ];
    const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  return (
    <div className="space-y-3">
      {/* Interaction Buttons */}
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLike}
          className={`flex items-center space-x-1 ${
            hasLiked 
              ? 'text-red-500 hover:text-red-600' 
              : 'text-gray-600 hover:text-red-500'
          }`}
          data-testid={`button-like-${post.id}`}
        >
          <Heart 
            className={`w-4 h-4 ${hasLiked ? 'fill-current' : ''}`} 
          />
          <span className="font-medium">{post.likes}</span>
          <span className="hidden sm:inline">
            {post.likes === 1 ? 'Like' : 'Likes'}
          </span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowComments(true)}
          className="flex items-center space-x-1 text-gray-600 hover:text-blue-500"
          data-testid={`button-comments-${post.id}`}
        >
          <MessageCircle className="w-4 h-4" />
          <span className="font-medium">{post.comments.length}</span>
          <span className="hidden sm:inline">
            {post.comments.length === 1 ? 'Comentario' : 'Comentarios'}
          </span>
        </Button>
      </div>

      {/* Comments Modal */}
      <Dialog open={showComments} onOpenChange={setShowComments}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col" data-testid={`modal-comments-${post.id}`}>
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <MessageCircle className="w-5 h-5 text-blue-500" />
              <span>Comentarios ({post.comments.length})</span>
            </DialogTitle>
            <DialogDescription>
              Conversación sobre: "{post.title}"
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto space-y-4 py-4">
            {/* Post Summary */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Avatar className="w-8 h-8">
                  <AvatarImage src="" />
                  <AvatarFallback className={`${post.authorAvatar || 'bg-gray-500'} text-white text-xs`}>
                    {post.authorName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="font-semibold text-sm">{post.authorName}</span>
              </div>
              <h4 className="font-semibold text-gray-900">{post.title}</h4>
              <p className="text-gray-600 text-sm mt-1 line-clamp-2">{post.description}</p>
            </div>

            <Separator />

            {/* Comments List */}
            {post.comments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No hay comentarios aún</p>
                <p className="text-sm">¡Sé el primero en comentar!</p>
              </div>
            ) : (
              <div className="space-y-4" data-testid={`comments-list-${post.id}`}>
                {post.comments.map((comment) => (
                  <div 
                    key={comment.id} 
                    className="flex space-x-3"
                    data-testid={`comment-${comment.id}`}
                  >
                    <Avatar className="w-8 h-8 flex-shrink-0">
                      <AvatarImage src="" />
                      <AvatarFallback className={`${generateAvatar(comment.authorId)} text-white text-xs`}>
                        {comment.authorName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-semibold text-sm" data-testid={`comment-author-${comment.id}`}>
                            {comment.authorName}
                          </span>
                          {comment.authorId === currentUserId && (
                            <span className="text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded">
                              Tú
                            </span>
                          )}
                          <span className="text-xs text-gray-500" data-testid={`comment-time-${comment.id}`}>
                            {formatRelativeTime(comment.timestamp)}
                          </span>
                        </div>
                        <p className="text-gray-800 text-sm" data-testid={`comment-content-${comment.id}`}>
                          {comment.content}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add Comment Form */}
          <div className="border-t pt-4 space-y-3">
            <Label htmlFor="newComment">Agregar comentario</Label>
            <div className="flex space-x-2">
              <Input
                id="newComment"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Escribe tu comentario..."
                disabled={isSubmittingComment}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleAddComment();
                  }
                }}
                data-testid={`input-new-comment-${post.id}`}
              />
              <Button
                onClick={handleAddComment}
                disabled={!newComment.trim() || isSubmittingComment}
                size="sm"
                className="bg-blue-500 hover:bg-blue-600 text-white"
                data-testid={`button-send-comment-${post.id}`}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-gray-500">
              Presiona Enter para enviar
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}