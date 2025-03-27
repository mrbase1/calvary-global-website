import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Database } from '../../types/supabase';
import { toast } from 'react-toastify';

type EmailTemplate = Database['public']['Tables']['email_templates']['Row'];

export function AdminEmail() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  // Removed unused 'sending' and 'setSending' state variables

  useEffect(() => {
    fetchTemplates();
  }, []);

  async function fetchTemplates() {
    try {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast.error('Failed to load email templates');
    } finally {
      setLoading(false);
    }
  }

  async function saveTemplate(template: Partial<EmailTemplate>) {
    try {
      const { data, error } = await supabase
        .from('email_templates')
        .upsert(template)
        .select()
        .single();

      if (error) throw error;
      
      setTemplates(templates.map(t => 
        t.id === data.id ? data : t
      ));
      
      toast.success('Template saved successfully');
    } catch (error) {
      console.error('Error saving template:', error);
      toast.error('Failed to save template');
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">Email Management</h1>

      {loading ? (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Email Templates</h2>
            <div className="space-y-4">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50"
                  onClick={() => setSelectedTemplate(template)}
                >
                  <h3 className="font-medium">{template.name}</h3>
                  <p className="text-sm text-gray-500">{template.subject}</p>
                </div>
              ))}
            </div>
          </div>

          {selectedTemplate && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Edit Template</h2>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  saveTemplate(selectedTemplate);
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    value={selectedTemplate.name}
                    onChange={(e) => setSelectedTemplate({
                      ...selectedTemplate,
                      name: e.target.value
                    })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Subject</label>
                  <input
                    type="text"
                    value={selectedTemplate.subject}
                    onChange={(e) => setSelectedTemplate({
                      ...selectedTemplate,
                      subject: e.target.value
                    })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Body</label>
                  <textarea
                    value={selectedTemplate.body}
                    onChange={(e) => setSelectedTemplate({
                      ...selectedTemplate,
                      body: e.target.value
                    })}
                    rows={6}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700"
                >
                  Save Template
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
}