
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
    const { resumeText, jobDescription } = await req.json();
    
    if (!openAIApiKey) {
      throw new Error('Missing OpenAI API key');
    }

    if (!resumeText || !jobDescription) {
      throw new Error('Missing resume text or job description');
    }

    console.log('Analyzing resume against job description');

    const systemPrompt = `
    You are an expert ATS (Applicant Tracking System) analyzer. Your job is to analyze a resume against a job description and provide detailed feedback.
    Return your analysis in the following JSON format:
    {
      "score": number (0-100 representing overall ATS compatibility score),
      "keywordMatch": {
        "matched": ["keyword1", "keyword2", ...],
        "missing": ["keyword1", "keyword2", ...]
      },
      "formatIssues": ["issue1", "issue2", ...],
      "contentSuggestions": ["suggestion1", "suggestion2", ...],
      "overallFeedback": "detailed paragraph of overall feedback",
      "sectionFeedback": {
        "summary": "feedback on the summary section",
        "experience": "feedback on work experience",
        "education": "feedback on education",
        "skills": "feedback on skills section"
      }
    }
    `;

    const userPrompt = `
    Please analyze this resume:
    
    ${resumeText}
    
    Against this job description:
    
    ${jobDescription}
    
    Provide a detailed analysis focusing on:
    1. Overall ATS compatibility score (0-100)
    2. Keyword matches and gaps
    3. Format issues that might prevent proper ATS parsing
    4. Content improvement suggestions
    5. Section-by-section analysis
    6. Overall feedback with specific recommendations
    `;

    console.log('Sending analysis request to OpenAI');
    
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
        temperature: 0.5,
        response_format: { type: "json_object" }
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('OpenAI API error:', data);
      throw new Error(`OpenAI API error: ${data.error?.message || 'Unknown error'}`);
    }
    
    const analysis = JSON.parse(data.choices[0].message.content);
    console.log('Analysis completed successfully');

    // Store analysis in database (if supabase client is available)
    // This would be implemented if we had direct database access from the edge function

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in ats-analyzer function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
