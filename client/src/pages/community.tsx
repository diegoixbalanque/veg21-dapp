import { useState, useEffect } from "react";
import { useWallet } from "@/hooks/use-wallet";
import { Header } from "@/components/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { communityService, CommunityPost } from "@/lib/community-service";
import { RecipeForm } from "@/components/recipe-form";
import { PostInteractions } from "@/components/post-interactions";
import { 
  Plus, 
  Clock, 
  Users, 
  Heart, 
  MessageCircle, 
  ChefHat, 
  Lightbulb, 
  Star,
  Filter 
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

type PostFilter = 'all' | 'recipe' | 'tip' | 'experience';

export default function Community() {
  const { isConnected, formattedAddress } = useWallet();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [showRecipeForm, setShowRecipeForm] = useState(false);
  const [filter, setFilter] = useState<PostFilter>('all');
  const [refreshKey, setRefreshKey] = useState(0);

  // Load posts when component mounts or refreshKey changes
  useEffect(() => {
    loadPosts();
  }, [refreshKey]);

  // Initialize sample data if needed
  useEffect(() => {
    communityService.initializeSampleData();
    loadPosts();
  }, []);

  const loadPosts = () => {
    const allPosts = filter === 'all' 
      ? communityService.getPosts()
      : communityService.getPostsByType(filter);
    setPosts(allPosts);
  };

  const handleNewPost = () => {
    setShowRecipeForm(false);
    setRefreshKey(prev => prev + 1); // Trigger refresh
  };

  const handleInteraction = () => {
    setRefreshKey(prev => prev + 1); // Trigger refresh after like/comment
  };

  const getPostTypeIcon = (type: CommunityPost['type']) => {
    switch (type) {
      case 'recipe': return <ChefHat className="w-4 h-4" />;
      case 'tip': return <Lightbulb className="w-4 h-4" />;
      case 'experience': return <Star className="w-4 h-4" />;
      default: return <MessageCircle className="w-4 h-4" />;
    }
  };

  const getPostTypeBadge = (type: CommunityPost['type']) => {
    switch (type) {
      case 'recipe': return <Badge className="bg-green-100 text-green-800">Receta</Badge>;
      case 'tip': return <Badge className="bg-blue-100 text-blue-800">Consejo</Badge>;
      case 'experience': return <Badge className="bg-purple-100 text-purple-800">Experiencia</Badge>;
      default: return <Badge className="bg-gray-100 text-gray-800">Post</Badge>;
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

  const communityStats = communityService.getCommunityStats();

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Conecta tu wallet para unirte a la comunidad
            </h1>
            <p className="text-gray-600">
              Comparte recetas veganas, consejos y experiencias con otros miembros de VEG21.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Sidebar with Stats and Actions */}
          <div className="lg:col-span-1 space-y-6">
            {/* Community Stats */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm" data-testid="card-community-stats">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <Users className="w-5 h-5 text-veg-primary" />
                  <span>Estadísticas</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Posts totales</span>
                  <span className="font-semibold" data-testid="stat-total-posts">{communityStats.totalPosts}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Recetas</span>
                  <span className="font-semibold" data-testid="stat-recipes">{communityStats.recipeCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Consejos</span>
                  <span className="font-semibold" data-testid="stat-tips">{communityStats.tipCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Likes totales</span>
                  <span className="font-semibold text-red-500" data-testid="stat-total-likes">{communityStats.totalLikes}</span>
                </div>
              </CardContent>
            </Card>

            {/* New Post Button */}
            <Button
              onClick={() => setShowRecipeForm(true)}
              className="w-full bg-gradient-to-r from-veg-primary to-veg-secondary text-white hover:from-veg-secondary hover:to-veg-primary"
              data-testid="button-new-post"
            >
              <Plus className="w-4 h-4 mr-2" />
              Compartir contenido
            </Button>

            {/* Filters */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm" data-testid="card-filters">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <Filter className="w-5 h-5 text-veg-primary" />
                  <span>Filtros</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {(['all', 'recipe', 'tip', 'experience'] as PostFilter[]).map((filterType) => (
                  <Button
                    key={filterType}
                    variant={filter === filterType ? "default" : "ghost"}
                    className={`w-full justify-start ${
                      filter === filterType 
                        ? "bg-veg-primary text-white" 
                        : "text-gray-700 hover:text-veg-primary"
                    }`}
                    onClick={() => setFilter(filterType)}
                    data-testid={`filter-${filterType}`}
                  >
                    {filterType === 'all' && <MessageCircle className="w-4 h-4 mr-2" />}
                    {filterType === 'recipe' && <ChefHat className="w-4 h-4 mr-2" />}
                    {filterType === 'tip' && <Lightbulb className="w-4 h-4 mr-2" />}
                    {filterType === 'experience' && <Star className="w-4 h-4 mr-2" />}
                    {filterType === 'all' ? 'Todos' : 
                     filterType === 'recipe' ? 'Recetas' :
                     filterType === 'tip' ? 'Consejos' : 'Experiencias'}
                  </Button>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Main Feed */}
          <div className="lg:col-span-3 space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-gray-900">
                Comunidad VEG21 🌱
              </h1>
              <div className="text-sm text-gray-600">
                {posts.length} {filter === 'all' ? 'posts' : 
                 filter === 'recipe' ? 'recetas' :
                 filter === 'tip' ? 'consejos' : 'experiencias'}
              </div>
            </div>

            {/* Posts Feed */}
            <div className="space-y-6">
              {posts.length === 0 ? (
                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm text-center py-12" data-testid="empty-feed">
                  <CardContent>
                    <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {filter === 'all' ? 'No hay posts aún' : 
                       filter === 'recipe' ? 'No hay recetas aún' :
                       filter === 'tip' ? 'No hay consejos aún' : 'No hay experiencias aún'}
                    </h3>
                    <p className="text-gray-600 mb-6">
                      ¡Sé el primero en compartir contenido con la comunidad!
                    </p>
                    <Button
                      onClick={() => setShowRecipeForm(true)}
                      className="bg-veg-primary hover:bg-veg-secondary"
                      data-testid="button-first-post"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Crear primer post
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                posts.map((post) => (
                  <Card 
                    key={post.id} 
                    className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-shadow"
                    data-testid={`post-${post.id}`}
                  >
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src="" />
                            <AvatarFallback className={`${post.authorAvatar || 'bg-gray-500'} text-white text-sm font-medium`}>
                              {post.authorName.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-semibold text-gray-900" data-testid={`author-${post.id}`}>
                                {post.authorName}
                              </span>
                              {post.authorId === formattedAddress && (
                                <Badge variant="outline" className="text-xs">Tú</Badge>
                              )}
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                              <Clock className="w-3 h-3" />
                              <span data-testid={`timestamp-${post.id}`}>{formatRelativeTime(post.timestamp)}</span>
                            </div>
                          </div>
                        </div>
                        {getPostTypeBadge(post.type)}
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      {/* Post Title */}
                      <div className="flex items-start space-x-2">
                        {getPostTypeIcon(post.type)}
                        <h3 className="text-xl font-semibold text-gray-900" data-testid={`title-${post.id}`}>
                          {post.title}
                        </h3>
                      </div>

                      {/* Post Description */}
                      <p className="text-gray-700 leading-relaxed" data-testid={`description-${post.id}`}>
                        {post.description}
                      </p>

                      {/* Recipe-specific content */}
                      {post.type === 'recipe' && (post.ingredients || post.preparationSteps) && (
                        <div className="space-y-4 bg-green-50 p-4 rounded-lg border border-green-100">
                          {post.ingredients && (
                            <div>
                              <h4 className="font-semibold text-green-800 mb-2">Ingredientes:</h4>
                              <pre className="text-sm text-green-700 whitespace-pre-wrap font-sans" data-testid={`ingredients-${post.id}`}>
                                {post.ingredients}
                              </pre>
                            </div>
                          )}
                          {post.preparationSteps && (
                            <div>
                              <h4 className="font-semibold text-green-800 mb-2">Preparación:</h4>
                              <pre className="text-sm text-green-700 whitespace-pre-wrap font-sans" data-testid={`steps-${post.id}`}>
                                {post.preparationSteps}
                              </pre>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Mock Image Display */}
                      {post.imageUrl && (
                        <div className="bg-gray-100 p-4 rounded-lg border-2 border-dashed border-gray-300 text-center">
                          <div className="text-gray-500 text-sm">
                            📸 Imagen: {post.imageUrl}
                          </div>
                        </div>
                      )}

                      <Separator />

                      {/* Post Interactions */}
                      <PostInteractions 
                        post={post} 
                        currentUserId={formattedAddress || ''}
                        onInteraction={handleInteraction}
                      />
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recipe Form Modal */}
      <RecipeForm 
        isOpen={showRecipeForm}
        onClose={() => setShowRecipeForm(false)}
        onSubmit={handleNewPost}
      />
    </div>
  );
}