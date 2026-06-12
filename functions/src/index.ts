import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

admin.initializeApp();

// HTTP callable functions automatically verify Firebase Auth tokens
// and provide the user info in context.auth

import { generateWeeklyPlan } from './weeklyPlanGenerator';
import { sendWeeklyEmailSummary } from './emailSummary';

export const weeklyPlan = functions.https.onCall(generateWeeklyPlan);
export const emailSummary = functions.pubsub.schedule('every sunday 20:00').onRun(sendWeeklyEmailSummary);
