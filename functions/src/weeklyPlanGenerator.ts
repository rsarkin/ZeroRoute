import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

export const generateWeeklyPlan = async (data: any, context: functions.https.CallableContext) => {
  // Enforce authentication
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Endpoint requires authentication.');
  }

  const { familyId, weekStart } = data;
  if (!familyId || !weekStart) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing familyId or weekStart');
  }

  const db = admin.firestore();
  
  // 1 Call per family per week rate limit
  const planRef = db.collection('weeklyPlans')
    .where('familyId', '==', familyId)
    .where('weekStart', '==', weekStart);
    
  const existingPlans = await planRef.get();
  
  if (!existingPlans.empty) {
    throw new functions.https.HttpsError('already-exists', 'A weekly plan already exists for this week.');
  }

  // Generate stub plan, placeholder for Gemini Vertex AI logic
  const plan = {
    familyId,
    weekStart,
    sharedGoal: "Reduce AC usage by 1 hour daily",
    memberActions: [],
    hotspotCategory: "energy",
    reasoningText: "We analyzed your logs and found energy usage is higher than usual. Focus on AC reduction this week.",
    suggestions: [],
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  };

  const newDoc = await db.collection('weeklyPlans').add(plan);
  return { id: newDoc.id, ...plan };
};
