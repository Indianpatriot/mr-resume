
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const geminiApiKey = Deno.env.get('gemini_api_key');
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { resumeText, jobDescription } = await req.json();
    
    if (!geminiApiKey) {
      throw new Error('Missing Gemini API key');
    }

    if (!resumeText || !jobDescription) {
      throw new Error('Missing resume text or job description');
    }

    console.log('Analyzing resume against job description');

    const prompt = `
    You are an expert ATS (Applicant Tracking System) analyzer. Analyze this resume:
    
    ${resumeText}
    
    Against this job description:
    
    ${jobDescription}
    
    Provide detailed analysis including:
    1. Overall ATS compatibility score (0-100)
    2. Keywords found and missing from the job description
    3. Format issues that might prevent proper ATS parsing
    4. Content improvement suggestions
    5. Section-by-section analysis
    6. Overall feedback
    
    Return response in this exact JSON format:
    {
      "score": number,
      "keywordMatch": {
        "matched": ["keyword1", "keyword2"],
        "missing": ["keyword1", "keyword2"]
      },
      "formatIssues": ["issue1", "issue2"],
      "contentSuggestions": ["suggestion1", "suggestion2"],
      "sectionFeedback": {
        "summary": "feedback text",
        "experience": "feedback text",
        "education": "feedback text",
        "skills": "feedback text"
      },
      "overallFeedback": "detailed feedback paragraph"
    }`;

    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': geminiApiKey,
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
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

    const analysisText = data.candidates[0].content.parts[0].text;
    let analysis;
    
    try {
      // Extract JSON from the response text - Gemini might wrap it in markdown code blocks
      const jsonMatch = analysisText.match(/```json\n?(.*)\n?```/s) || analysisText.match(/{[\s\S]*}/);
      const jsonStr = jsonMatch ? jsonMatch[1] || jsonMatch[0] : analysisText;
      analysis = JSON.parse(jsonStr);
    } catch (error) {
      console.error('Error parsing Gemini response:', error);
      throw new Error('Failed to parse analysis results');
    }

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
