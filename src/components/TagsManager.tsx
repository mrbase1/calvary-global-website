import React from 'react';
import { X, Plus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Database } from '../types/supabase';
import { toast } from 'react-toastify';

type Tag = Database['public']['Tables']['blog_tags']['Row'];

interface TagsManagerProps {
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
}

export function TagsManager({ selectedTags, onTagsChange }: TagsManagerProps) {
  const [tags, setTags] = React.useState<Tag[]>([]);
  const [newTag, setNewTag] = React.useState('');

  React.useEffect(() => {
    fetchTags();
  }, []);

  async function fetchTags() {
    try {
      const { data, error } = await supabase
        .from('blog_tags')
        .select('*')
        .order('name');

      if (error) throw error;
      setTags(data || []);
    } catch (error) {
      console.error('Error fetching tags:', error);
      toast.error('Failed to load tags');
    }
  }

  async function handleAddTag() {
    if (!newTag.trim()) return;

    try {
      const slug = newTag.toLowerCase().replace(/\s+/g, '-');
      const { data, error } = await supabase
        .from('blog_tags')
        .insert({ name: newTag.trim(), slug })
        .select()
        .single();

      if (error) throw error;

      setTags([...tags, data]);
      setNewTag('');
      onTagsChange([...selectedTags, data.id]);
    } catch (error) {
      console.error('Error adding tag:', error);
      toast.error('Failed to add tag');
    }
  }

  function handleTagSelect(tagId: string) {
    if (selectedTags.includes(tagId)) {
      onTagsChange(selectedTags.filter(id => id !== tagId));
    } else {
      onTagsChange([...selectedTags, tagId]);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input
          type="text"
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
          placeholder="Add new tag..."
          className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
        />
        <button
          type="button"
          onClick={handleAddTag}
          className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 inline-flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <button
            key={tag.id}
            type="button"
            onClick={() => handleTagSelect(tag.id)}
            className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
              selectedTags.includes(tag.id)
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {tag.name}
            {selectedTags.includes(tag.id) && (
              <X className="h-4 w-4 ml-1" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}