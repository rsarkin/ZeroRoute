rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    // ─────────────────────────────────────────
    // HELPER FUNCTIONS
    // ─────────────────────────────────────────

    // Check if the user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }

    // Check if the authenticated user owns this document
    function isOwner(uid) {
      return request.auth.uid == uid;
    }

    // Check if the authenticated user belongs to this family
    function isFamilyMember(familyId) {
      return isAuthenticated() &&
        exists(/databases/$(database)/documents/familyMembers/$(request.auth.uid + '_' + familyId));
    }

    // Check if the request is coming from a Cloud Function (admin)
    function isAdmin() {
      return request.auth.token.admin == true;
    }

    // Validate that required fields are present on write
    function hasRequiredFields(fields) {
      return request.resource.data.keys().hasAll(fields);
    }


    // ─────────────────────────────────────────
    // FAMILIES
    // Only the creator can read and write
    // their own family document
    // ─────────────────────────────────────────

    match /families/{familyId} {
      allow read: if isAuthenticated() &&
        isFamilyMember(familyId);

      allow create: if isAuthenticated() &&
        isOwner(request.resource.data.creatorUid) &&
        hasRequiredFields(['name', 'creatorUid', 'neighbourhoodId', 'cityId', 'goalPercent', 'createdAt']);

      allow update: if isAuthenticated() &&
        isFamilyMember(familyId) &&
        isOwner(resource.data.creatorUid);

      allow delete: if isAuthenticated() &&
        isOwner(resource.data.creatorUid);
    }


    // ─────────────────────────────────────────
    // FAMILY MEMBERS
    // Readable and writable only by the
    // family creator
    // ─────────────────────────────────────────

    match /familyMembers/{memberId} {
      allow read: if isAuthenticated() &&
        isFamilyMember(resource.data.familyId);

      allow create: if isAuthenticated() &&
        hasRequiredFields(['familyId', 'name', 'ageGroup']) &&
        isFamilyMember(request.resource.data.familyId);

      allow update: if isAuthenticated() &&
        isFamilyMember(resource.data.familyId);

      allow delete: if isAuthenticated() &&
        isFamilyMember(resource.data.familyId);
    }


    // ─────────────────────────────────────────
    // VEHICLES
    // Readable and writable only by
    // authenticated family members
    // ─────────────────────────────────────────

    match /vehicles/{vehicleId} {
      allow read: if isAuthenticated() &&
        isFamilyMember(resource.data.familyId);

      allow create: if isAuthenticated() &&
        hasRequiredFields(['familyId', 'type', 'label', 'hasEvBadge']) &&
        isFamilyMember(request.resource.data.familyId);

      allow update: if isAuthenticated() &&
        isFamilyMember(resource.data.familyId);

      allow delete: if isAuthenticated() &&
        isFamilyMember(resource.data.familyId);
    }


    // ─────────────────────────────────────────
    // EMISSION LOGS
    // Family members can create and read
    // their own family logs
    // Nobody can edit or delete a log
    // (immutable audit trail)
    // ─────────────────────────────────────────

    match /emissionLogs/{logId} {
      allow read: if isAuthenticated() &&
        isFamilyMember(resource.data.familyId);

      allow create: if isAuthenticated() &&
        isFamilyMember(request.resource.data.familyId) &&
        hasRequiredFields(['familyId', 'memberId', 'category', 'subType', 'value', 'unit', 'co2Kg', 'date']);

      // Logs are immutable — no updates or deletes allowed
      allow update: if false;
      allow delete: if false;
    }


    // ─────────────────────────────────────────
    // WEEKLY PLANS
    // Only Cloud Functions write weekly plans
    // Family members can only read their plan
    // and update suggestion completion status
    // ─────────────────────────────────────────

    match /weeklyPlans/{planId} {
      allow read: if isAuthenticated() &&
        isFamilyMember(resource.data.familyId);

      // Only admin (Cloud Function) can create plans
      allow create: if isAdmin();

      // Family members can only mark suggestions as completed
      allow update: if isAuthenticated() &&
        isFamilyMember(resource.data.familyId) &&
        request.resource.data.diff(resource.data).affectedKeys()
          .hasOnly(['suggestions']);

      allow delete: if false;
    }


    // ─────────────────────────────────────────
    // NUDGE ALERTS
    // Only Cloud Functions create nudges
    // Family members can read and dismiss
    // ─────────────────────────────────────────

    match /nudgeAlerts/{nudgeId} {
      allow read: if isAuthenticated() &&
        isFamilyMember(resource.data.familyId);

      // Only Cloud Function creates nudges
      allow create: if isAdmin();

      // Family members can only dismiss a nudge
      allow update: if isAuthenticated() &&
        isFamilyMember(resource.data.familyId) &&
        request.resource.data.diff(resource.data).affectedKeys()
          .hasOnly(['dismissed']);

      allow delete: if false;
    }


    // ─────────────────────────────────────────
    // BADGES
    // Only Cloud Functions award badges
    // Family members can only read
    // ─────────────────────────────────────────

    match /badges/{badgeId} {
      allow read: if isAuthenticated() &&
        isFamilyMember(resource.data.familyId);

      // Only Cloud Function awards badges
      allow create: if isAdmin();

      // Badges are immutable once earned
      allow update: if false;
      allow delete: if false;
    }


    // ─────────────────────────────────────────
    // FOREST STATE
    // Family members can read their forest
    // Only Cloud Functions update tree stages
    // ─────────────────────────────────────────

    match /forestStates/{familyId} {
      allow read: if isAuthenticated() &&
        isFamilyMember(familyId);

      // Only Cloud Function updates forest state
      allow create: if isAdmin();
      allow update: if isAdmin();
      allow delete: if false;
    }


    // ─────────────────────────────────────────
    // LEADERBOARD
    // Any authenticated user can read
    // Only Cloud Functions write
    // ─────────────────────────────────────────

    match /leaderboard/{entryId} {
      allow read: if isAuthenticated();

      // Only Cloud Function writes leaderboard
      allow create: if isAdmin();
      allow update: if isAdmin();
      allow delete: if false;
    }


    // ─────────────────────────────────────────
    // NEIGHBOURHOOD COHORTS
    // Any authenticated user can read
    // Nobody can write from client side
    // ─────────────────────────────────────────

    match /neighbourhoods/{neighbourhoodId} {
      allow read: if isAuthenticated();
      allow write: if false;
    }


    // ─────────────────────────────────────────
    // DEFAULT DENY
    // Any collection not explicitly listed
    // above is completely blocked
    // ─────────────────────────────────────────

    match /{document=**} {
      allow read, write: if false;
    }

  }
}