
import { supabase } from "@/integrations/supabase/client";

export interface ResumeTemplate {
  id: string;
  name: string;
  description: string;
  thumbnail_url: string;
  content: {
    layout: string;
    style: {
      colors: {
        primary: string;
        secondary: string;
        accent: string;
      };
      typography: {
        headingFont: string;
        bodyFont: string;
      };
      spacing: {
        sectionGap: string;
        elementGap: string;
      };
    };
    sections: {
      order: string[];
      config: Record<string, {
        visible: boolean;
        layout: string;
      }>;
    };
  };
  is_premium: boolean;
  created_at: string;
  updated_at: string;
}

export async function getResumeTemplates(): Promise<ResumeTemplate[]> {
  try {
    console.log("Fetching resume templates from Supabase");
    const { data, error } = await supabase
      .from('resume_templates')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching templates:', error);
      throw error;
    }

    if (!data || data.length === 0) {
      console.log('No templates found in database, returning defaults');
      return defaultTemplates;
    }

    console.log(`Retrieved ${data.length} templates from database`);
    return data.map(template => ({
      ...template,
      content: template.content as ResumeTemplate['content']
    })) as ResumeTemplate[];
  } catch (error) {
    console.error('Error in getResumeTemplates:', error);
    return defaultTemplates;
  }
}

export async function getTemplateById(id: string): Promise<ResumeTemplate | null> {
  try {
    const { data, error } = await supabase
      .from('resume_templates')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching template:', error);
      
      // Try to find in default templates
      const defaultTemplate = defaultTemplates.find(t => t.id === id);
      if (defaultTemplate) {
        return defaultTemplate;
      }
      
      throw error;
    }

    if (!data) return null;
    
    return {
      ...data,
      content: data.content as ResumeTemplate['content']
    } as ResumeTemplate;
  } catch (error) {
    console.error('Error in getTemplateById:', error);
    // Try to find in default templates as fallback
    return defaultTemplates.find(t => t.id === id) || null;
  }
}

// Default templates for initial setup
export const defaultTemplates: ResumeTemplate[] = [
  {
    id: 'classic-professional',
    name: 'Classic Professional',
    description: 'A timeless template suitable for traditional industries',
    thumbnail_url: 'https://images.pexels.com/photos/3760529/pexels-photo-3760529.jpeg',
    content: {
      layout: 'single-column',
      style: {
        colors: {
          primary: '#2D3748',
          secondary: '#4A5568',
          accent: '#3182CE'
        },
        typography: {
          headingFont: 'Georgia, serif',
          bodyFont: 'Arial, sans-serif'
        },
        spacing: {
          sectionGap: '2rem',
          elementGap: '1rem'
        }
      },
      sections: {
        order: ['header', 'summary', 'experience', 'education', 'skills'],
        config: {
          header: { visible: true, layout: 'centered' },
          summary: { visible: true, layout: 'full-width' },
          experience: { visible: true, layout: 'timeline' },
          education: { visible: true, layout: 'compact' },
          skills: { visible: true, layout: 'grid' }
        }
      }
    },
    is_premium: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'modern-minimal',
    name: 'Modern Minimal',
    description: 'A clean and contemporary design for creative professionals',
    thumbnail_url: 'https://images.pexels.com/photos/3760067/pexels-photo-3760067.jpeg',
    content: {
      layout: 'two-column',
      style: {
        colors: {
          primary: '#1A202C',
          secondary: '#718096',
          accent: '#F56565'
        },
        typography: {
          headingFont: 'Helvetica, sans-serif',
          bodyFont: 'Helvetica, sans-serif'
        },
        spacing: {
          sectionGap: '2.5rem',
          elementGap: '1.25rem'
        }
      },
      sections: {
        order: ['header', 'skills', 'experience', 'education', 'summary'],
        config: {
          header: { visible: true, layout: 'minimal' },
          summary: { visible: true, layout: 'sidebar' },
          experience: { visible: true, layout: 'cards' },
          education: { visible: true, layout: 'list' },
          skills: { visible: true, layout: 'tags' }
        }
      }
    },
    is_premium: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'executive-premium',
    name: 'Executive Premium',
    description: 'A sophisticated design for senior professionals and executives',
    thumbnail_url: 'https://images.pexels.com/photos/3760958/pexels-photo-3760958.jpeg',
    content: {
      layout: 'hybrid',
      style: {
        colors: {
          primary: '#1A365D',
          secondary: '#2D3748',
          accent: '#9F7AEA'
        },
        typography: {
          headingFont: 'Garamond, serif',
          bodyFont: 'Calibri, sans-serif'
        },
        spacing: {
          sectionGap: '3rem',
          elementGap: '1.5rem'
        }
      },
      sections: {
        order: ['header', 'summary', 'experience', 'skills', 'education'],
        config: {
          header: { visible: true, layout: 'executive' },
          summary: { visible: true, layout: 'highlight' },
          experience: { visible: true, layout: 'detailed' },
          education: { visible: true, layout: 'formal' },
          skills: { visible: true, layout: 'categorized' }
        }
      }
    },
    is_premium: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];
