import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Eye, Calendar } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Database } from '../../types/supabase';
import { toast } from 'react-toastify';

type BlogArticle = Database['public']['Tables']['blog_articles']['Row'] & {
  profiles: { full_name: string };
  blog_tags: { name: string }[];
};

export function AdminBlog() {
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
            blog_tags(name)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setArticles(data || []);
    } catch (error) {
      console.error('Error fetching articles:', error);
      toast.error('Failed to load articles');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this article?')) return;

    try {
      const { error } = await supabase
        .from('blog_articles')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setArticles(articles.filter(article => article.id !== id));
      toast.success('Article deleted successfully');
    } catch (error) {
      console.error('Error deleting article:', error);
      toast.error('Failed to delete article');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Blog Management</h1>
        <Link
          to="new"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Article
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {articles.map((article) => (
              <li key={article.id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-medium text-gray-900 truncate">
                        {article.title}
                      </h3>
                      <div className="mt-2 flex items-center text-sm text-gray-500">
                        <Calendar className="flex-shrink-0 mr-1.5 h-4 w-4" />
                        {new Date(article.created_at).toLocaleDateString()}
                        <span className="mx-2">•</span>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            article.status === 'published'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {article.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Link
                        to={`/blog/${article.slug}`}
                        className="p-2 text-gray-400 hover:text-gray-500"
                        target="_blank"
                      >
                        <Eye className="h-5 w-5" />
                      </Link>
                      <Link
                        to={`edit/${article.id}`}
                        className="p-2 text-blue-400 hover:text-blue-500"
                      >
                        <Edit className="h-5 w-5" />
                      </Link>
                      <button
                        onClick={() => handleDelete(article.id)}
                        className="p-2 text-red-400 hover:text-red-500"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}