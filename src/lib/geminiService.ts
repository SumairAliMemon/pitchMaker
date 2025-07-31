// Gemini AI Service for generating pitches
import { UserProfile } from './profileService'

export interface GeminiResponse {
  candidates: {
    content: {
      parts: {
        text: string
      }[]
    }
  }[]
}

export class GeminiService {
  private apiKey: string
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async generatePitch(
    userProfile: UserProfile,
    jobDescription: string,
    jobTitle: string,
    companyName: string
  ): Promise<string> {
    const prompt = this.createPitchPrompt(userProfile, jobDescription, jobTitle, companyName)
    
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': this.apiKey
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024
          }
        })
      })

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status} ${response.statusText}`)
      }

      const data: GeminiResponse = await response.json()
      
      if (data.candidates && data.candidates.length > 0) {
        return data.candidates[0].content.parts[0].text
      } else {
        throw new Error('No response generated from Gemini')
      }
    } catch (error) {
      console.error('Gemini API Error:', error)
      throw error
    }
  }

  private createPitchPrompt(
    userProfile: UserProfile,
    jobDescription: string,
    jobTitle: string,
    companyName: string
  ): string {
    return `Write a professional cover letter for this job application. Make it sound natural and human, not AI-generated.

Candidate Information:
Name: ${userProfile.full_name || 'Candidate'}
Email: ${userProfile.email}
Background: ${userProfile.background_details || 'Professional background not specified'}
Skills: ${userProfile.skills || 'Skills not specified'}
Experience: ${userProfile.experience || 'Experience not specified'}
Education: ${userProfile.education || 'Education not specified'}

Job Information:
Position: ${jobTitle}
Company: ${companyName}
Job Description: ${jobDescription}

STRICT REQUIREMENTS:
- Write ONLY the cover letter content, nothing else
- NO markdown formatting (**, *, #, bullet points, etc.)
- NO AI-sounding phrases like "I am excited to" or "I would be thrilled"
- NO cliché phrases like "perfect fit" or "unique opportunity"
- Use natural, conversational language
- Make it sound like a real person wrote it, not AI
- Write in simple, clear sentences
- Avoid corporate jargon and buzzwords
- Keep it professional but human
- Length: 250-350 words maximum
- Start with "Dear Hiring Manager," or appropriate greeting
- End with "Best regards," or "Sincerely," followed by the name
- Focus on specific skills and experience relevant to the job
- Be direct and honest, not overly enthusiastic

Generate only the cover letter text that sounds genuinely human-written.`
  }
}

// Export singleton instance
export const geminiService = new GeminiService(
  process.env.NEXT_PUBLIC_GEMINI_API_KEY || ''
)
