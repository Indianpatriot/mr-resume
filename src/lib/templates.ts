import { supabase } from "@/integrations/supabase/client";

export interface ResumeTemplate {
  id: string;
  name: string;
  description: string;
  thumbnail_url: string;
  content: any;
  is_premium: boolean;
  created_at: string;
  updated_at: string;
}

export async function getResumeTemplates(): Promise<ResumeTemplate[]> {
  const { data, error } = await supabase
    .from('resume_templates')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching templates:', error);
    throw error;
  }

  return data || [];
}

export async function getTemplateById(id: string): Promise<ResumeTemplate | null> {
  const { data, error } = await supabase
    .from('resume_templates')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching template:', error);
    throw error;
  }

  return data;
}