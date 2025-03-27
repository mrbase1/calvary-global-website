import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { supabase } from '../../lib/supabase';
import { TagsManager } from '../../components/TagsManager'; // Adjust the path as needed
import { uploadBlogImage } from '../../utils/storage';
import { toast } from 'react-toastify';
import slugify from 'slugify';
import { FaSave as Save } from 'react-icons/fa'; // Import Save icon from react-icons

interface BlogForm {
  title: string;
  excerpt: string;
  content: string;
  status: 'draft' | 'published';
  cover_image?: FileList;
}

export function BlogEditor() {
  let { id } = useParams();
  const navigate = useNavigate();
  const [selectedTags, setSelectedTags] = React.useState<string[]>([]);
  const [coverPreview, setCoverPreview] = React.useState<string>('');
  const { register, handleSubmit, setValue, formState: { errors }, watch } = useForm<BlogForm>();
  const quillRef = React.useRef<ReactQuill>(null);

  React.useEffect(() => {
    async function fetchArticle() {
        try {
          const { data: article, error } = await supabase
            .from('blog_articles')
            .select(`
              *,
              blog_article_tags!inner(tag_id)
            `)
            .eq('id', id)
            .single();
  
          if (error) throw error;
  
          setValue('title', article.title);
          setValue('excerpt', article.excerpt || '');
          setValue('content', article.content);
          setValue('status', article.status);
          setCoverPreview(article.cover_image || '');
          setSelectedTags(article.blog_article_tags.map((t: { tag_id: string }) => t.tag_id));
        } catch (error) {
          console.error('Error fetching article:', error);
          toast.error('Failed to load article');
          navigate('/admin/blog');
      }
    }
    
    if (id) {
      fetchArticle();
    }
  }, [id, navigate, setValue]);
    

  const modules = React.useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        ['blockquote', 'code-block'],
        ['link', 'image'],
        ['clean']
      ],
      handlers: {
        image: () => imageHandler()
      }
    }
  }), []);

  async function imageHandler() {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
      const file = input.files?.[0];
      if (file) {
        try {
          const url = await uploadBlogImage(file);
          const quill = quillRef.current?.getEditor();
          const range = quill?.getSelection();
          quill?.insertEmbed(range?.index || 0, 'image', url);
        } catch (error) {
          toast.error('Failed to upload image');
        }
      }
    };
  }

  async function onSubmit(data: BlogForm) {
    try {
      let coverImageUrl = coverPreview;

      if (data.cover_image?.[0]) {
        coverImageUrl = await uploadBlogImage(data.cover_image[0]);
      }

      const slug = slugify(data.title, { lower: true, strict: true });
      const article = {
        title: data.title,
        slug,
        excerpt: data.excerpt,
        content: data.content,
        cover_image: coverImageUrl,
        status: data.status,
        published_at: data.status === 'published' ? new Date().toISOString() : null
      };

      if (id) {
        await supabase.from('blog_articles').update(article).eq('id', id);
      } else {
        const { data: newArticle } = await supabase
          .from('blog_articles')
          .insert(article)
          .select()
          .single();
        id = newArticle.id;
      }

      // Update tags
      await supabase
        .from('blog_article_tags')
        .delete()
        .eq('article_id', id);

      if (selectedTags.length > 0) {
        await supabase.from('blog_article_tags').insert(
          selectedTags.map(tagId => ({
            article_id: id,
            tag_id: tagId
          }))
        );
      }

      toast.success('Article saved successfully');
      navigate('/admin/blog');
    } catch (error) {
      console.error('Error saving article:', error);
      toast.error('Failed to save article');
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">
          {id ? 'Edit Article' : 'New Article'}
        </h1>
        <button
          type="submit"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700"
        >
          <Save className="h-4 w-4 mr-2" />
          Save Article
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Title</label>
          <input
            type="text"
            {...register('title', { required: 'Title is required' })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Excerpt</label>
          <textarea
            {...register('excerpt')}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Cover Image</label>
          <div className="mt-1 flex items-center space-x-4">
            <input
              type="file"
              accept="image/*"
              {...register('cover_image')}
              className="hidden"
              id="cover-image"
            />
            <label
              htmlFor="cover-image"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <img src="" alt="Icon" className="h-4 w-4 mr-2" />
              Choose Image
            </label>
            {coverPreview && (
              <img src={coverPreview} alt="Cover preview" className="h-20 w-20 object-cover rounded" />
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Content</label>
          <ReactQuill
            ref={quillRef}
            value={watch('content')}
            onChange={(content) => setValue('content', content)}
            modules={modules}
            className="mt-1 block w-full"
            theme="snow"
          />
        </div>

        <div>
          {/* Ensure TagsManager is imported or defined */}
          <TagsManager
            selectedTags={selectedTags}
            onTagsChange={setSelectedTags}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Status</label>
          <select
            {...register('status')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>
      </div>
    </form>
  );
}