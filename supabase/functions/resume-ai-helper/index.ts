
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
    const { section, context, prompt, currentContent, page = 1, filter = "", action, suggestionId, feedback } = await req.json();

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

    // Updated Gemini API URL and format - using the correct endpoint
    const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent";

    let promptText = "";

    // For summary generation
    if (section === "summary") {
      const { jobTitle, industry, experienceLevel } = context || {};
      promptText = `
        Generate a professional resume summary for a ${experienceLevel || "mid-level"} ${jobTitle || "professional"} in the ${industry || "technology"} industry.
        ${prompt || ""}
        Make it concise (2-4 sentences), professional, and highlight key strengths.
        Current content for reference (improve upon this): ${currentContent || ""}
      `;
    } 
    // For experience descriptions
    else if (section === "experience") {
      const { company, position } = prompt || {};
      promptText = `
        Generate a professional job description for a ${position || "role"} at ${company || "a company"}.
        Focus on quantifiable achievements and key responsibilities.
        Make it concise (3-5 bullet points worth), professional, and highlight relevant skills.
        Current content for reference (improve upon this): ${currentContent || ""}
      `;
    } 
    // For skills suggestions
    else if (section === "skills") {
      const { jobTitle, industry, experienceLevel } = context || {};
      promptText = `
        Generate a list of 10 relevant professional skills for a ${experienceLevel || "mid-level"} ${jobTitle || "professional"} in the ${industry || "technology"} industry.
        Return the response as a JSON array of strings, like this: ["skill1", "skill2", "skill3"]
        Current skills for reference (do not include these): ${currentContent ? JSON.stringify(currentContent) : "[]"}
      `;
    }
    // For general suggestions
    else {
      promptText = `
        Generate professional content suggestions for a resume ${section}.
        Context: ${context || ""}
        Category: ${section || "content"}
        Filter criteria: ${filter || ""}
        
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
    }

    console.log("Sending prompt to Gemini:", promptText);

    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': geminiApiKey,
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: promptText }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Gemini API error: ${response.status} - ${response.statusText}`, errorText);
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log("Gemini API response:", JSON.stringify(data).substring(0, 200) + "...");

    // Handle different response formats
    if (section === "summary" || section === "experience") {
      // For direct content generation like summary or job description
      const generatedText = data.candidates[0].content.parts[0].text;
      
      return new Response(
        JSON.stringify({ success: true, content: generatedText }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else if (section === "skills") {
      // For skills list generation
      try {
        // Extract skills from the response
        const responseText = data.candidates[0].content.parts[0].text;
        
        // Try to find and parse the JSON array in the response
        const skillsMatch = responseText.match(/\[.*\]/s);
        let skills = [];
        
        if (skillsMatch) {
          skills = JSON.parse(skillsMatch[0]);
        } else {
          // Fallback: split by lines or commas if JSON parsing fails
          skills = responseText.split(/[\n,]+/)
            .map(s => s.trim())
            .filter(s => s && !s.includes('[') && !s.includes(']') && !s.includes('{') && !s.includes('}'));
        }
        
        return new Response(
          JSON.stringify({ success: true, skills }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (error) {
        console.error('Error parsing skills:', error);
        throw new Error('Failed to parse skills from AI response');
      }
    } else {
      // For suggestions list
      try {
        // Try to find and parse the JSON in the response
        const responseText = data.candidates[0].content.parts[0].text;
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        let suggestions = [];
        
        if (jsonMatch) {
          const parsedData = JSON.parse(jsonMatch[0]);
          suggestions = parsedData.suggestions || [];
        } else {
          throw new Error('Failed to parse suggestions from AI response');
        }
        
        // Store suggestions in database
        const { error } = await supabase
          .from('ai_suggestions')
          .insert(suggestions.map((s: any) => ({
            ...s,
            created_at: new Date().toISOString(),
          })));

        if (error) throw error;

        return new Response(
          JSON.stringify({ success: true, suggestions }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (error) {
        console.error('Error parsing suggestions:', error);
        throw new Error('Failed to parse suggestions from AI response');
      }
    }
  } catch (error) {
    console.error('Error in resume-ai-helper function:', error);
    return new Response(
      JSON.stringify({ error: error.message, success: false }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
