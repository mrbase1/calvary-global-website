import React from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Database } from '../types/supabase';
import { Calendar } from 'lucide-react';

type BlogArticle = Database['public']['Tables']['blog_articles']['Row'] & {
  profiles: { full_name: string };
  blog_tags: { name: string; slug: string }[];
  blog_article_tags: { blog_tags: { name: string; slug: string } }[];
};

export function Blog() {
  const [articles, setArticles] = React.useState<BlogArticle[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetchArticles();
  }, []);

  async function fetchArticles() {
    try {
      const { data, error } = await supabase
        .from('blog_articles')
        .select(`
          *,
          profiles:author_id(full_name),
          blog_article_tags(
            blog_tags(name, slug)
          )
        `)
        .eq('status', 'published')
        .order('published_at', { ascending: false });

      if (error) throw error;

      setArticles(data || []);
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Blog</h1>
        
        {loading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <Link
                key={article.id}
                to={`/blog/${article.slug}`}
                className="group bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow"
              >
                {article.cover_image && (
                  <div className="aspect-w-16 aspect-h-9">
                    <img
                      src={article.cover_image}
                      alt={article.title}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform"
                    />
                  </div>
                )}
                <div className="p-6">
                  <div className="flex items-center text-sm text-gray-500 mb-2">
                    <Calendar className="h-4 w-4 mr-1" />
                    {new Date(article.published_at!).toLocaleDateString()}
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-purple-600">
                    {article.title}
                  </h2>
                  {article.excerpt && (
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {article.excerpt}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      By {article.profiles.full_name}
                    </span>
                    {article.blog_article_tags && (
                      <div className="flex gap-2">
                        {article.blog_article_tags.map(({ blog_tags }) => (
                          <span
                            key={blog_tags.slug}
                            className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-600"
                          >
                            {blog_tags.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}