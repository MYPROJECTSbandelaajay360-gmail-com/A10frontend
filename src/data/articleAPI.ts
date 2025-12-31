import { Article } from '@/types';
import { articles as staticArticles } from './articles';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export async function fetchArticlesFromAPI(): Promise<Article[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/articles?published=true`, {
      cache: 'no-store', // Always fetch fresh data
    });

    if (!response.ok) {
      console.error('Failed to fetch articles from API, using static data');
      return staticArticles;
    }

    const data = await response.json();
    
    // Transform API response to match Article type
    const articles: Article[] = data.map((article: any) => ({
      id: article._id,
      title: article.title,
      description: article.description,
      category: article.category,
      imageUrl: article.imageUrl,
      createdAt: article.createdAt,
      updatedAt: article.updatedAt,
      views: article.views,
      content: article.content,
    }));

    // Combine API articles with static articles (keep first 4 static ones)
    const combinedArticles = [...staticArticles.slice(0, 4), ...articles];
    
    return combinedArticles;
  } catch (error) {
    console.error('Error fetching articles from API:', error);
    // Fallback to static articles
    return staticArticles;
  }
}

export async function fetchArticleByIdFromAPI(id: string): Promise<Article | null> {
  try {
    // First check if it's a static article (IDs 1-4)
    const staticArticle = staticArticles.find(a => a.id === id);
    if (staticArticle) {
      return staticArticle;
    }

    // Try to fetch from API
    const response = await fetch(`${API_BASE_URL}/api/articles?id=${id}`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    
    return {
      id: data._id,
      title: data.title,
      description: data.description,
      category: data.category,
      imageUrl: data.imageUrl,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      views: data.views,
      content: data.content,
    };
  } catch (error) {
    console.error('Error fetching article from API:', error);
    return null;
  }
}








