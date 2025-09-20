// Community Service for VEG21 dApp
// Manages community posts, likes, and comments with localStorage persistence

import { nanoid } from 'nanoid';

export interface CommunityPost {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  title: string;
  description: string;
  ingredients?: string;
  preparationSteps?: string;
  imageUrl?: string;
  type: 'recipe' | 'tip' | 'experience';
  timestamp: string;
  likes: number;
  likedBy: string[];
  comments: Comment[];
}

export interface Comment {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  timestamp: string;
  parentId?: string; // For nested replies
}

export interface CreatePostData {
  title: string;
  description: string;
  ingredients?: string;
  preparationSteps?: string;
  imageUrl?: string;
  type: 'recipe' | 'tip' | 'experience';
}

// Storage keys
const STORAGE_KEYS = {
  POSTS: 'veg21_community_posts',
  USER_INTERACTIONS: 'veg21_user_interactions'
} as const;

// User interaction tracking (likes, etc.)
interface UserInteractions {
  likedPosts: string[];
}

class CommunityService {
  private posts: CommunityPost[] = [];
  private userInteractions: UserInteractions = { likedPosts: [] };

  constructor() {
    this.loadFromStorage();
  }

  // Load data from localStorage
  private loadFromStorage() {
    try {
      const storedPosts = localStorage.getItem(STORAGE_KEYS.POSTS);
      if (storedPosts) {
        this.posts = JSON.parse(storedPosts);
      }

      const storedInteractions = localStorage.getItem(STORAGE_KEYS.USER_INTERACTIONS);
      if (storedInteractions) {
        this.userInteractions = JSON.parse(storedInteractions);
      }
    } catch (error) {
      console.error('Failed to load community data from storage:', error);
    }
  }

  // Save data to localStorage
  private saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(this.posts));
      localStorage.setItem(STORAGE_KEYS.USER_INTERACTIONS, JSON.stringify(this.userInteractions));
    } catch (error) {
      console.error('Failed to save community data to storage:', error);
    }
  }

  // Get all posts, sorted by timestamp (newest first)
  getPosts(): CommunityPost[] {
    return [...this.posts].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  // Create a new post
  createPost(authorId: string, authorName: string, postData: CreatePostData): CommunityPost {
    const newPost: CommunityPost = {
      id: nanoid(),
      authorId,
      authorName,
      authorAvatar: this.generateAvatar(authorId),
      title: postData.title,
      description: postData.description,
      ingredients: postData.ingredients,
      preparationSteps: postData.preparationSteps,
      imageUrl: postData.imageUrl,
      type: postData.type,
      timestamp: new Date().toISOString(),
      likes: 0,
      likedBy: [],
      comments: []
    };

    this.posts.push(newPost);
    this.saveToStorage();
    return newPost;
  }

  // Toggle like on a post
  toggleLike(postId: string, userId: string): boolean {
    const post = this.posts.find(p => p.id === postId);
    if (!post) return false;

    const hasLiked = post.likedBy.includes(userId);
    
    if (hasLiked) {
      // Remove like
      post.likedBy = post.likedBy.filter(id => id !== userId);
      post.likes = Math.max(0, post.likes - 1);
      this.userInteractions.likedPosts = this.userInteractions.likedPosts.filter(id => id !== postId);
    } else {
      // Add like
      post.likedBy.push(userId);
      post.likes += 1;
      this.userInteractions.likedPosts.push(postId);
    }

    this.saveToStorage();
    return !hasLiked; // Return new like state
  }

  // Add comment to a post
  addComment(postId: string, authorId: string, authorName: string, content: string, parentId?: string): Comment | null {
    const post = this.posts.find(p => p.id === postId);
    if (!post) return null;

    const newComment: Comment = {
      id: nanoid(),
      authorId,
      authorName,
      content,
      timestamp: new Date().toISOString(),
      parentId
    };

    post.comments.push(newComment);
    this.saveToStorage();
    return newComment;
  }

  // Get post by ID
  getPost(postId: string): CommunityPost | null {
    return this.posts.find(p => p.id === postId) || null;
  }

  // Check if user has liked a post
  hasUserLiked(postId: string): boolean {
    return this.userInteractions.likedPosts.includes(postId);
  }

  // Get posts by type
  getPostsByType(type: CommunityPost['type']): CommunityPost[] {
    return this.getPosts().filter(post => post.type === type);
  }

  // Get user's posts
  getUserPosts(authorId: string): CommunityPost[] {
    return this.getPosts().filter(post => post.authorId === authorId);
  }

  // Generate avatar color based on user ID
  private generateAvatar(userId: string): string {
    const colors = [
      'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-purple-500', 
      'bg-pink-500', 'bg-indigo-500', 'bg-yellow-500', 'bg-teal-500'
    ];
    const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  }

  // Get community stats
  getCommunityStats() {
    const totalPosts = this.posts.length;
    const totalLikes = this.posts.reduce((sum, post) => sum + post.likes, 0);
    const totalComments = this.posts.reduce((sum, post) => sum + post.comments.length, 0);
    const recipeCount = this.posts.filter(p => p.type === 'recipe').length;
    const tipCount = this.posts.filter(p => p.type === 'tip').length;
    const experienceCount = this.posts.filter(p => p.type === 'experience').length;

    return {
      totalPosts,
      totalLikes,
      totalComments,
      recipeCount,
      tipCount,
      experienceCount
    };
  }

  // Initialize with some sample posts if empty (for demo purposes)
  initializeSampleData(currentUserId?: string, currentUserName?: string) {
    if (this.posts.length === 0) {
      const samplePosts: CreatePostData[] = [
        {
          title: "Tacos Veganos de Jackfruit",
          description: "Una receta deliciosa que simula el sabor de la carne usando jackfruit joven. Perfecta para principiantes en la cocina vegana.",
          ingredients: "- 1 lata de jackfruit joven en salmuera\n- 2 cucharadas de aceite de oliva\n- 1 cebolla picada\n- 2 dientes de ajo\n- 1 cucharadita de comino\n- 1 cucharadita de paprika\n- Sal y pimienta al gusto\n- Tortillas de maíz\n- Aguacate, tomate, cilantro para servir",
          preparationSteps: "1. Escurre y desmenuza el jackfruit con un tenedor\n2. Calienta aceite en una sartén y sofríe cebolla y ajo\n3. Agrega el jackfruit y especias, cocina 10-15 minutos\n4. Sirve en tortillas con los acompañamientos",
          type: "recipe"
        },
        {
          title: "Beneficios de las proteínas vegetales",
          description: "Descubrí que combinando legumbres con cereales obtienes proteínas completas. ¡Ya no me preocupo por no comer suficiente proteína!",
          type: "tip"
        }
      ];

      // Add sample posts with mock authors
      samplePosts.forEach((postData, index) => {
        this.createPost(
          `sample_user_${index}`,
          `VegUser${index + 1}`,
          postData
        );
      });
    }
  }

  // Reset all data (for testing/development)
  resetData() {
    this.posts = [];
    this.userInteractions = { likedPosts: [] };
    this.saveToStorage();
  }
}

// Export singleton instance
export const communityService = new CommunityService();