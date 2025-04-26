
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const geminiApiKey = Deno.env.get('gemini_api_key');
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { section, prompt, currentContent, jobTitle, industry, experienceLevel } = await req.json();
    
    if (!geminiApiKey) {
      throw new Error('Missing Gemini API key');
    }

    console.log(`Generating content for section: ${section}`);
    console.log(`Job details - Title: ${jobTitle}, Industry: ${industry}, Experience: ${experienceLevel}`);

    let userPrompt = '';
    switch (section) {
      case 'summary':
        userPrompt = `Write a professional summary for a ${experienceLevel} ${jobTitle} in the ${industry} industry. 
          Make it concise, impactful, and highlight key strengths. The summary should be approximately 3-4 sentences.`;
        if (currentContent) {
          userPrompt += ` Here's their current summary for reference or improvement: "${currentContent}"`;
        }
        break;
        
      case 'experience':
        userPrompt = `Write powerful job description bullet points for a ${jobTitle} position.`;
        if (currentContent) {
          userPrompt += ` Here's their current job description for reference or improvement: "${currentContent}"`;
        }
        if (prompt?.company) {
          userPrompt += ` Company: ${prompt.company}, Position: ${prompt.position}`;
        }
        userPrompt += ` Focus on accomplishments with metrics where possible. Use strong action verbs. Write 3-5 bullet points.`;
        break;
        
      case 'skills':
        userPrompt = `List 8-12 relevant technical skills and soft skills for a ${experienceLevel} ${jobTitle} in the ${industry} industry. 
          Format the response as a JSON array of strings.`;
        if (currentContent && Array.isArray(currentContent)) {
          userPrompt += ` Current skills: ${currentContent.join(', ')}. Suggest additional relevant skills.`;
        }
        break;
        
      default:
        userPrompt = prompt || 'Please provide content to generate suggestions for.';
    }

    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': geminiApiKey,
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: userPrompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
        }
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('Gemini API error:', data);
      throw new Error(`Gemini API error: ${JSON.stringify(data)}`);
    }

    const generatedText = data.candidates[0].content.parts[0].text;
    
    let formattedResponse;
    if (section === 'skills') {
      try {
        // Try to parse skills as JSON array
        const skillsMatch = generatedText.match(/\[[\s\S]*\]/);
        const skillsJson = skillsMatch ? skillsMatch[0] : generatedText;
        const skills = JSON.parse(skillsJson);
        formattedResponse = { skills };
      } catch (error) {
        // Fallback to text parsing if JSON parsing fails
        const skillsList = generatedText
          .split(/[,\n]+/)
          .map(skill => skill.trim())
          .filter(skill => skill.length > 0 && !skill.match(/^[•\-\*]$/));
        formattedResponse = { skills: skillsList };
      }
    } else {
      formattedResponse = { content: generatedText };
    }

    return new Response(JSON.stringify(formattedResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in resume-ai-helper function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
