import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { section, context, page = 1, filter = "", action, suggestionId, feedback } = await req.json();

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Handle feedback submission
    if (action === 'feedback' && suggestionId) {
      const { error } = await supabase
        .from('ai_suggestions_feedback')
        .insert({
          suggestion_id: suggestionId,
          feedback: feedback,
        });

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate suggestions using Gemini API
    const geminiApiKey = Deno.env.get('gemini_api_key');
    if (!geminiApiKey) {
      throw new Error('Missing Gemini API key');
    }

    const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";

    const prompt = `
      Generate professional content suggestions for a resume ${section}.
      Context: ${context}
      Category: ${section}
      Filter criteria: ${filter}
      
      Return exactly 10 suggestions in this JSON format:
      {
        "suggestions": [
          {
            "id": "unique-id",
            "content": "suggestion text",
            "category": "${section}",
            "rating": 0
          }
        ]
      }
    `;

    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': geminiApiKey,
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const data = await response.json();
    const suggestions = JSON.parse(data.candidates[0].content.parts[0].text).suggestions;

    // Store suggestions in database
    const { error } = await supabase
      .from('ai_suggestions')
      .insert(suggestions.map((s: any) => ({
        ...s,
        created_at: new Date().toISOString(),
      })));

    if (error) throw error;

    return new Response(
      JSON.stringify({ suggestions }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in resume-ai-helper function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});