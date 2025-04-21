
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

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
    const { section, prompt, currentContent, jobTitle, industry, experienceLevel } = await req.json();
    
    if (!openAIApiKey) {
      throw new Error('Missing OpenAI API key');
    }

    console.log(`Generating content for section: ${section}`);
    console.log(`Job details - Title: ${jobTitle}, Industry: ${industry}, Experience: ${experienceLevel}`);

    let systemPrompt = "You are an expert resume writer and career coach with years of experience helping job seekers create ATS-friendly resumes.";
    let userPrompt = '';

    switch (section) {
      case 'summary':
        userPrompt = `Write a professional summary for a ${experienceLevel} ${jobTitle} in the ${industry} industry. Make it concise, impactful, and highlight key strengths. The summary should be approximately 3-4 sentences.`;
        if (currentContent) {
          userPrompt += ` Here's their current summary for reference or improvement: "${currentContent}"`;
        }
        if (prompt) {
          userPrompt += ` Additional context from the user: ${prompt}`;
        }
        break;
        
      case 'experience':
        userPrompt = `Write a powerful job description bullet points for a ${jobTitle} position.`;
        if (currentContent) {
          userPrompt += ` Here's their current job description for reference or improvement: "${currentContent}"`;
        }
        if (prompt) {
          userPrompt += ` Company: ${prompt.company}, Position: ${prompt.position}. Additional context: ${prompt.context || ''}`;
        }
        userPrompt += ` Focus on accomplishments with metrics where possible. Use strong action verbs. Write 3-5 bullet points, each starting with an action verb.`;
        break;
        
      case 'skills':
        userPrompt = `List 8-12 relevant skills for a ${experienceLevel} ${jobTitle} in the ${industry} industry. Include a mix of technical skills, soft skills, and industry-specific knowledge.`;
        if (currentContent && Array.isArray(currentContent) && currentContent.length > 0) {
          userPrompt += ` Here are their current skills for reference: ${currentContent.join(', ')}. Suggest additional skills they might be missing.`;
        }
        break;
        
      default:
        userPrompt = prompt || 'Please provide content to generate suggestions for.';
    }

    console.log(`Sending prompt to OpenAI: ${userPrompt.substring(0, 100)}...`);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('OpenAI API error:', data);
      throw new Error(`OpenAI API error: ${data.error?.message || 'Unknown error'}`);
    }
    
    const generatedContent = data.choices[0].message.content;
    console.log(`Generated content (truncated): ${generatedContent.substring(0, 100)}...`);

    let formattedResponse;
    
    if (section === 'skills') {
      // Extract skills from the generated text
      // This is a simple extraction - it assumes skills are separated by commas or newlines
      const skillText = generatedContent.replace(/\d+\.\s+/g, ''); // Remove numbering if present
      const skills = skillText.split(/[,\n]+/).map(skill => skill.trim())
        .filter(skill => skill.length > 0 && !skill.match(/^[•\-\*]$/)); // Filter out empty items and single bullet points
      formattedResponse = { skills };
    } else {
      formattedResponse = { content: generatedContent };
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
