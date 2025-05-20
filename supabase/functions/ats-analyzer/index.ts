
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
    const requestData = await req.json();
    
    // Handle text extraction from various file formats if that's the requested action
    if (requestData.action === "extractText") {
      if (!requestData.fileContent) {
        throw new Error('Missing file content');
      }
      
      // For PDF extraction and other document types
      if (requestData.fileType && geminiApiKey) {
        try {
          // Remove the data URI prefix to get the base64 content
          const base64Content = requestData.fileContent.split(',')[1];
          
          // Construct appropriate prompt based on file type
          let prompt = '';
          
          if (requestData.fileType === "pdf") {
            prompt = `
            This is a base64 encoded PDF resume document. Extract ALL the readable text content from it. 
            Format the text in a clean, readable way preserving paragraphs, sections, and bullet points.
            Focus on extracting:
            - Personal information (name, contact details)
            - Professional summary
            - Work experience with dates, titles, and descriptions
            - Education details
            - Skills and certifications
            - Any other relevant resume sections
            
            Here is the base64 content:
            ${base64Content.substring(0, 3000)}... (truncated for brevity)
            
            ONLY return the extracted text content, nothing else. Format it as a proper resume text.`;
          } else if (requestData.fileType === "docx" || requestData.fileType === "doc") {
            prompt = `
            This is a base64 encoded Word document resume. Extract ALL the readable text content from it.
            Format the text in a clean, readable way preserving paragraphs, sections, and bullet points.
            Focus on extracting:
            - Personal information (name, contact details)
            - Professional summary
            - Work experience with dates, titles, and descriptions
            - Education details
            - Skills and certifications
            - Any other relevant resume sections
            
            Here is the base64 content:
            ${base64Content.substring(0, 3000)}... (truncated for brevity)
            
            ONLY return the extracted text content, nothing else. Format it as a proper resume text.`;
          } else {
            // For other document types
            prompt = `
            This is a base64 encoded document that contains resume content. Extract ALL the readable text.
            Format the text in a clean, readable way preserving the structure of the resume.
            
            Here is the base64 content:
            ${base64Content.substring(0, 3000)}... (truncated for brevity)
            
            ONLY return the extracted text content, nothing else. Format it as a proper resume text.`;
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
                  text: prompt
                }]
              }],
              generationConfig: {
                temperature: 0.1,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 8192,
              }
            }),
          });
          
          const data = await response.json();
          
          if (!response.ok) {
            console.error('Gemini API error:', data);
            throw new Error(`Gemini API error: ${JSON.stringify(data)}`);
          }
          
          const extractedText = data.candidates[0].content.parts[0].text;
          
          // Clean up the extracted text to remove any markdown code blocks or unnecessary formatting
          const cleanedText = extractedText
            .replace(/```(.*?)```/gs, '$1') // Remove code blocks if any
            .replace(/^[\s\n]*|[\s\n]*$/g, ''); // Trim whitespace
          
          return new Response(
            JSON.stringify({ 
              text: cleanedText,
              success: true 
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } catch (error) {
          console.error('Error extracting text from document:', error);
          throw new Error(`Failed to extract text from document: ${error.message}`);
        }
      }
      
      // For plain text files, return the content as-is
      return new Response(
        JSON.stringify({ text: requestData.fileContent, success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Handle the original ATS analysis functionality
    const { resumeText, jobDescription } = requestData;
    
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
    return new Response(JSON.stringify({ error: error.message, success: false }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
