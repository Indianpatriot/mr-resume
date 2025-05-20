
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { resumeData, userId, title, templateId } = await req.json();
    
    if (!resumeData || !title) {
      throw new Error('Missing required data');
    }

    console.log('Saving resume:', { title, userId });

    // Create a random UUID for anonymous users since Supabase requires a UUID format
    const userIdToUse = userId || crypto.randomUUID();

    // Save resume to database
    const { data, error } = await supabase
      .from('resumes')
      .insert({
        title,
        user_id: userIdToUse,
        content: {
          type: 'resume',
          version: '1.0',
          data: resumeData,
          templateId,
          created_at: new Date().toISOString()
        },
      })
      .select();

    if (error) {
      throw error;
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Resume saved successfully',
        data,
        resumeId: data?.[0]?.id
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Error saving resume:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
