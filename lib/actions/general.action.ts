"use server";

import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { db } from "@/firebase/admin";
import { feedbackSchema } from "@/constants";

export async function createFeedback(params: CreateFeedbackParams) {
  const { interviewId, userId, transcript, feedbackId } = params;

  try {
    const formattedTranscript = transcript
      .map(
        (sentence: { role: string; content: string }) =>
          `- ${sentence.role}: ${sentence.content}\n`
      )
      .join("");

    const result = await generateObject({
      model: google("gemini-2.0-flash-001", {
        structuredOutputs: false,
      }),
      schema: feedbackSchema,
      prompt: `
        You are an AI interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories. Be thorough and detailed in your analysis. Don't be lenient with the candidate. If there are mistakes or areas for improvement, point them out.

        Transcript:
        ${formattedTranscript}

        Please analyze the candidate and provide:

        1. A totalScore (0-100) representing the overall performance
        2. categoryScores as an array of exactly 5 objects with:
           - Communication Skills (clarity, articulation, structured responses)
           - Technical Knowledge (understanding of key concepts for the role)
           - Problem Solving (ability to analyze problems and propose solutions)
           - Cultural Fit (alignment with company values and job role)
           - Confidence and Clarity (confidence in responses, engagement, and clarity)
        
        Each category should have:
        - name: exact category name as specified
        - score: number from 0-100
        - comment: detailed explanation of the score

        3. strengths: array of specific strengths observed
        4. areasForImprovement: array of specific areas needing improvement
        5. finalAssessment: overall summary of the candidate's performance

        Return a properly structured JSON object matching the required schema.
      `,
      system: `You are a professional interviewer analyzing a mock interview. 
               You must return exactly the structure specified in the schema:
               - totalScore: number
               - categoryScores: array of 5 category objects
               - strengths: array of strings
               - areasForImprovement: array of strings  
               - finalAssessment: string
               
               The categoryScores must contain exactly these 5 categories in order:
               1. "Communication Skills"
               2. "Technical Knowledge" 
               3. "Problem Solving"
               4. "Cultural Fit"
               5. "Confidence and Clarity"`,
    });

    // Add additional validation before parsing
    if (!result.object) {
      throw new Error("No object generated from AI model");
    }

    console.log("AI Response:", JSON.stringify(result.object, null, 2));

    const object = feedbackSchema.parse(result.object); // ✅ Zod validation

    const feedback = {
      interviewId,
      userId,
      totalScore: object.totalScore,
      categoryScores: object.categoryScores,
      strengths: object.strengths,
      areasForImprovement: object.areasForImprovement,
      finalAssessment: object.finalAssessment,
      createdAt: new Date().toISOString(),
    };

    let feedbackRef;

    if (feedbackId) {
      feedbackRef = db.collection("feedback").doc(feedbackId);
    } else {
      feedbackRef = db.collection("feedback").doc();
    }

    await feedbackRef.set(feedback);

    return { success: true, feedbackId: feedbackRef.id };
  } catch (error) {
    console.error("Error saving feedback:", error);
    
    // Type-safe error handling
    let errorMessage = "An unknown error occurred";
    
    if (error instanceof Error) {
      errorMessage = error.message;
      
      // Check if it's a Zod validation error
      if (error.name === 'ZodError') {
        console.error("Zod validation errors:", (error as any).errors);
        errorMessage = "Validation failed: AI response doesn't match expected format";
      }
      
      // Check if it's an AI generation error
      if (error.message.includes('No object generated')) {
        errorMessage = "AI failed to generate structured response";
      }
    } else if (typeof error === 'string') {
      errorMessage = error;
    } else if (error && typeof error === 'object' && 'message' in error) {
      errorMessage = String((error as any).message);
    }
    
    return { success: false, error: errorMessage };
  }
}

// Rest of your functions remain the same...
export async function getInterviewById(id: string): Promise<Interview | null> {
  const interview = await db.collection("interviews").doc(id).get();
  return interview.data() as Interview | null;
}

export async function getFeedbackByInterviewId(
  params: GetFeedbackByInterviewIdParams
): Promise<Feedback | null> {
  const { interviewId, userId } = params;

  const querySnapshot = await db
    .collection("feedback")
    .where("interviewId", "==", interviewId)
    .where("userId", "==", userId)
    .limit(1)
    .get();

  if (querySnapshot.empty) return null;

  const feedbackDoc = querySnapshot.docs[0];
  return { id: feedbackDoc.id, ...feedbackDoc.data() } as Feedback;
}

export async function getLatestInterviews(
  params: GetLatestInterviewsParams
): Promise<Interview[] | null> {
  const { userId, limit = 20 } = params;

  const interviews = await db
    .collection("interviews")
    .orderBy("createdAt", "desc")
    .where("finalized", "==", true)
    .where("userId", "!=", userId)
    .limit(limit)
    .get();

  return interviews.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Interview[];
}

export async function getInterviewByUserId(
  userId: string
): Promise<Interview[] | null> {
  const interviews = await db
    .collection("interviews")
    .where("userId", "==", userId)
    .orderBy("createdAt", "desc")
    .get();

  return interviews.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Interview[];
}