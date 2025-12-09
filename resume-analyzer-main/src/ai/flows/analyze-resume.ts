'use server';

/**
 * @fileOverview Analyzes a resume and provides feedback on its strengths,
 * weaknesses, and areas for improvement.
 *
 * - analyzeResume - A function that handles the resume analysis process.
 * - AnalyzeResumeInput - The input type for the analyzeResume function.
 * - AnalyzeResumeOutput - The return type for the analyzeResume function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeResumeInputSchema = z.object({
  resumeDataUri: z
    .string()
    .describe(
      'The resume as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' // Corrected the expected format description
    ),
});
export type AnalyzeResumeInput = z.infer<typeof AnalyzeResumeInputSchema>;

const AnalyzeResumeOutputSchema = z.object({
  strengths: z.string().describe('Strengths of the resume.'),
  weaknesses: z.string().describe('Weaknesses of the resume.'),
  improvements: z.string().describe('Areas for improvement in the resume.'),
  overallFeedback: z.string().describe('Overall feedback on the resume.'),
  score: z
    .number()
    .describe(
      'An overall score for the resume on a scale of 0 to 100, where 100 is a perfect resume. This score should be based on the quality of the resume content, structure, and presentation.'
    ),
});
export type AnalyzeResumeOutput = z.infer<typeof AnalyzeResumeOutputSchema>;

export async function analyzeResume(input: AnalyzeResumeInput): Promise<AnalyzeResumeOutput> {
  const {output} = await prompt(input);
  return output!;
}

const prompt = ai.definePrompt({
  name: 'analyzeResumePrompt',
  input: {schema: AnalyzeResumeInputSchema},
  output: {schema: AnalyzeResumeOutputSchema},
  prompt: `You are an expert resume analyst and career coach, acting like a sophisticated Applicant Tracking System (ATS). Analyze the provided resume in detail.

Your analysis must provide:
1.  **Strengths**: Identify and list the strongest aspects of the resume.
2.  **Weaknesses**: Pinpoint the areas where the resume is lacking.
3.  **Improvements**: Suggest specific, actionable improvements.
4.  **Overall Feedback**: Give a summary of the resume's effectiveness.
5.  **ATS Score**: Provide a score from 0 to 100. This score is critical and must be based on a detailed evaluation of the following factors:
    *   **Formatting & Readability (25 points)**: Is the layout clean, professional, and easy to parse? Is it free of errors?
    *   **Keyword Optimization (25 points)**: Does it use relevant industry keywords? (Assume a generic professional job target).
    *   **Action Verbs & Impact (25 points)**: Are bullet points starting with strong action verbs? Do they quantify achievements?
    *   **Content Clarity & Conciseness (25 points)**: Is the language clear, direct, and professional? Is the information relevant?

Calculate the final score based on a rigorous assessment of these criteria. Do not give a generic score; it must reflect the resume's actual content.

Resume:
{{media url=resumeDataUri}}`,
  config: {
    temperature: 0.0,
  },
});

const analyzeResumeFlow = ai.defineFlow(
  {
    name: 'analyzeResumeFlow',
    inputSchema: AnalyzeResumeInputSchema,
    outputSchema: AnalyzeResumeOutputSchema,
  },
  async input => {
    // Add retry logic for rate limiting
    let attempts = 0;
    const maxAttempts = 3;
    const baseDelay = 1000; // 1 second
    
    while (attempts < maxAttempts) {
      try {
        const {output} = await prompt(input);
        return output!;
      } catch (e: any) {
        attempts++;
        console.error(`Attempt ${attempts} failed:`, e.message);
        // Check if it's a rate limiting error
        if (e.message && (e.message.includes('429') || e.message.includes('quota') || e.message.includes('Too Many Requests'))) {
          if (attempts < maxAttempts) {
            // Exponential backoff
            const delay = baseDelay * Math.pow(2, attempts - 1);
            console.log(`Rate limited. Retrying in ${delay}ms... (attempt ${attempts}/${maxAttempts})`);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          } else {
            // Max attempts reached, throw a more user-friendly error
            throw new Error('You have exceeded the API rate limit. Please wait a minute and try again, or consider upgrading your Google AI API plan.');
          }
        }
        // If not a rate limit error, rethrow immediately
        throw e;
      }
    }
    throw new Error('Failed to analyze resume after multiple attempts.');
  }
);
