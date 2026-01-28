/**
 * AI Service for generating interview questions using Google's Gemini API
 */
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize the API with the provided key
// In production, this should be in an environment variable
const API_KEY = 'AIzaSyCjwu9J_sgzxKti04HceuYQVwdged5ojkU';
const genAI = new GoogleGenerativeAI(API_KEY);

/**
 * Generate interview questions based on a professional summary using Gemini AI
 * @param {string} professionalSummary - The professional summary to generate questions from
 * @returns {Promise<Array<string>>} - An array of 5 interview questions
 */
async function generateInterviewQuestions(professionalSummary) {
  try {
    // For safety, check if we have a valid summary
    if (!professionalSummary || professionalSummary.trim() === '') {
      throw new Error('Professional summary is required');
    }
    
    console.log('Starting Gemini AI question generation for summary:', professionalSummary);
    console.log('Using API key:', API_KEY ? `${API_KEY.substring(0, 5)}...` : 'API key missing');
    
    if (!API_KEY || API_KEY.trim() === '') {
      throw new Error('Gemini API key is missing or invalid');
    }
    
    // Get the generative model - use gemini-pro for production
    try {
      console.log('Initializing Gemini AI model');
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
      
      // Create a prompt that instructs the AI to generate tailored interview questions
      const prompt = `
        As a professional interviewer, review the following professional summary and create 5 insightful interview questions 
        that would help evaluate this candidate's fit for a position related to their expertise.
        
        The questions should:
        1. Be specific to their background and skills
        2. Assess their problem-solving abilities
        3. Evaluate their expertise in their field
        4. Explore their professional aspirations
        5. Assess their fit with our organization (3% Generation Agency)
        
        Professional Summary: "${professionalSummary}"
        
        Format your response as a clean array of 5 questions only, without numbering or additional text.
      `;
      
      console.log('Sending prompt to Gemini AI');
      
      // Generate content using the model
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      console.log('Received raw response from Gemini AI:', text.substring(0, 100) + '...');
      
      // Parse the response into an array of questions
      // Split by newlines and filter out any empty lines
      const questions = text.split('\n')
        .map(line => line.trim())
        .filter(line => line && !line.startsWith('---') && !line.startsWith('#'))
        .slice(0, 5); // Ensure we get at most 5 questions
      
      console.log(`Parsed ${questions.length} questions from AI response`);
      
      // If we didn't get enough questions, add some generic ones
      while (questions.length < 5) {
        questions.push(getGenericQuestion(questions.length + 1));
      }
      
      console.log('Final AI-generated questions:', questions);
      return questions;
    } catch (modelError) {
      console.error('Error with Gemini model:', modelError);
      console.error('Error details:', JSON.stringify(modelError, null, 2));
      throw new Error(`Gemini model error: ${modelError.message}`);
    }
  } catch (error) {
    console.error('Error generating interview questions with AI:', error);
    console.error('Error stack:', error.stack);
    
    // Fall back to generic questions if the API call fails
    const fallbackQuestions = [
      `Based on your experience, what unique skill sets you apart from other candidates?`,
      `Can you describe a challenging situation you faced professionally and how you overcame it?`,
      `How do you see your expertise contributing to our company's growth and innovation?`,
      `What motivated you to pursue a career in this field?`,
      `Where do you see yourself professionally in the next 3-5 years?`
    ];
    
    console.log('Returning fallback questions due to error:', fallbackQuestions);
    return fallbackQuestions;
  }
}

// Helper function to provide generic questions if AI generation fails
function getGenericQuestion(index) {
  const genericQuestions = [
    `Based on your experience, what unique skill sets you apart from other candidates?`,
    `Can you describe a challenging situation you faced professionally and how you overcame it?`,
    `How do you see your expertise contributing to our company's growth and innovation?`,
    `What motivated you to pursue a career in this field?`,
    `Where do you see yourself professionally in the next 3-5 years?`
  ];
  
  return genericQuestions[index - 1] || genericQuestions[0];
}

module.exports = {
  generateInterviewQuestions
};
