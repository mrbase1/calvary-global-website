import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Database } from '../types/supabase';
import { Calendar, User } from 'lucide-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.bubble.css';

type BlogArticle = Database['public']['Tables']['blog_articles']['Row'] & {
  profiles: { full_name: string };
  blog_tags: { name: string; slug: string }[];
  blog_article_tags: { blog_tags: { name: string; slug: string } }[];
};

export function BlogPost() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = React.useState<BlogArticle | null>(null);
  const [loading, setLoading] = React.useState(true);

  async function fetchArticle() {
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
        .eq('slug', slug)
        .eq('status', 'published')
        .single();

      if (error) throw error;
      setArticle(data);
    } catch (error) {
      console.error('Error fetching article:', error);
      navigate('/blog');
    } finally {
      setLoading(false);
    }
  }
  
  React.useEffect(() => {
    fetchArticle();
  }, [slug]);

  

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!article) return null;

  return (
    <article className="py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {article.cover_image && (
          <div className="aspect-w-16 aspect-h-9 mb-8 rounded-lg overflow-hidden">
            <img
              src={article.cover_image}
              alt={article.title}
              className="object-cover w-full h-full"
            />
          </div>
        )}

        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          {article.title}
        </h1>

        <div className="flex items-center gap-4 text-gray-500 mb-8">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-1" />
            {new Date(article.published_at!).toLocaleDateString()}
          </div>
          <div className="flex items-center">
            <User className="h-4 w-4 mr-1" />
            {article.profiles.full_name}
          </div>
        </div>

        {article.blog_article_tags && article.blog_article_tags.length > 0 && (
          <div className="flex gap-2 mb-8">
            {article.blog_article_tags.map(({ blog_tags }) => (
              <span
                key={blog_tags.slug}
                className="px-3 py-1 rounded-full bg-purple-100 text-purple-600 text-sm"
              >
                {blog_tags.name}
              </span>
            ))}
          </div>
        )}

        <div className="prose prose-purple max-w-none">
          <ReactQuill
            value={typeof article.content === 'string' ? article.content : JSON.stringify(article.content)}
            readOnly={true}
            theme="bubble"
            modules={{ toolbar: false }}
          />
        </div>
      </div>
    </article>
  );
}