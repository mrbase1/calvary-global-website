import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Database } from '../../types/supabase';
import { toast } from 'react-toastify';
import { Plus, Info } from 'lucide-react';

type EmailTemplate = Database['public']['Tables']['email_templates']['Row'];

// Add available variables
const TEMPLATE_VARIABLES = {
  'user.full_name': 'User\'s full name',
  'user.email': 'User\'s email address',
  'church.name': 'Church name',
  'date.today': 'Current date',
  'date.time': 'Current time'
} as const;

// Add a helper component for variables
const VariablesHelper: React.FC = () => (
  <div className="bg-gray-50 p-4 rounded-md mt-2">
    <div className="flex items-center gap-2 mb-2 text-sm text-gray-600">
      <Info className="h-4 w-4" />
      <span>Available variables:</span>
    </div>
    <div className="grid grid-cols-2 gap-2">
      {Object.entries(TEMPLATE_VARIABLES).map(([variable, description]) => (
        <div key={variable} className="text-sm">
          <code className="bg-gray-100 px-1 py-0.5 rounded">{`{${variable}}`}</code>
          <span className="text-gray-600 ml-2">{description}</span>
        </div>
      ))}
    </div>
  </div>
);

// Add function to validate variables in template
const validateTemplateVariables = (text: string): boolean => {
  const variablePattern = /{([^}]+)}/g;
  const matches = text.match(variablePattern) || [];
  
  for (const match of matches) {
    const variable = match.slice(1, -1); // Remove { and }
    if (!Object.keys(TEMPLATE_VARIABLES).includes(variable)) {
      return false;
    }
  }
  return true;
};

export function AdminEmail() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

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

  const createNewTemplate = () => {
    const newTemplate: Partial<EmailTemplate> = {
      name: 'New Template',
      subject: '',
      body: '',
      created_at: new Date().toISOString()
    };
    setSelectedTemplate(newTemplate as EmailTemplate);
    setIsCreatingNew(true);
  };

  async function saveTemplate(template: Partial<EmailTemplate>) {
    try {
      // Debug: Check user role
      const { data: userProfile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .single();

      if (profileError) {
        console.error('Error checking user role:', profileError);
        toast.error('Could not verify user permissions');
        return;
      }

      console.log('Current user role:', userProfile?.role);

      if (userProfile?.role !== 'admin' && userProfile?.role !== 'pastor') {
        toast.error('You must be an admin or pastor to manage templates');
        return;
      }

      // Validate variables in template
      if (!validateTemplateVariables(template.subject || '') || 
          !validateTemplateVariables(template.body || '')) {
        toast.error('Template contains invalid variables');
        return;
      }

      const { data, error } = await supabase
        .from('email_templates')
        .upsert({
          ...template,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        if (error.code === '42501') {
          console.error('Permission denied:', error);
          toast.error('You don\'t have permission to manage email templates');
        } else {
          console.error('Error saving template:', error);
          toast.error(isCreatingNew ? 'Failed to create template' : 'Failed to update template');
        }
        return;
      }

      if (isCreatingNew) {
        setTemplates([data, ...templates]);
        setIsCreatingNew(false);
      } else {
        setTemplates(templates.map(t => 
          t.id === data.id ? data : t
        ));
      }
      
      toast.success(isCreatingNew ? 'Template created successfully' : 'Template updated successfully');
    } catch (error) {
      console.error('Error saving template:', error);
      toast.error('An unexpected error occurred');
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
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Email Templates</h2>
              <button
                onClick={createNewTemplate}
                className="flex items-center gap-2 px-3 py-2 text-sm bg-purple-600 text-white rounded-md hover:bg-purple-700"
              >
                <Plus className="h-4 w-4" />
                New Template
              </button>
            </div>
            <div className="space-y-4">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className={`p-4 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                    selectedTemplate?.id === template.id ? 'border-purple-500 bg-purple-50' : ''
                  }`}
                  onClick={() => {
                    setSelectedTemplate(template);
                    setIsCreatingNew(false);
                  }}
                >
                  <h3 className="font-medium">{template.name}</h3>
                  <p className="text-sm text-gray-500">{template.subject}</p>
                </div>
              ))}
            </div>
          </div>

          {selectedTemplate && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">
                {isCreatingNew ? 'Create New Template' : 'Edit Template'}
              </h2>
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
                    placeholder="Write your email template here..."
                  />
                  <VariablesHelper />
                </div>

                <button
                  type="submit"
                  className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700"
                >
                  {isCreatingNew ? 'Create Template' : 'Save Template'}
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
}