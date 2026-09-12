/**
 * =========================================================================
 * CURRICULUMAI — COMPLETE AUTONOMOUS LEAD & EMAIL DRIP AUTOMATION
 * =========================================================================
 * Connected to: CurriculumAI — Marketing Leads & Subscriber Database
 * Web Platform: https://www.curriculumaipro.com
 * Pro Checkout: https://buy.stripe.com/aFa6oA3rd5ODcDJ0895sA01
 * =========================================================================
 */

// 1. INBOUND WEBHOOK: Captures form submissions & sends immediate Email 1
function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(15000);

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = getOrCreateSubscribersSheet(ss);

    var rawContent = (e && e.postData) ? e.postData.contents : "{}";
    var data = {};
    try {
      data = JSON.parse(rawContent);
    } catch (parseErr) {
      data = (e && e.parameter) ? e.parameter : {};
    }

    var timestamp = new Date();
    var timestampStr = Utilities.formatDate(timestamp, "GMT-4", "yyyy-MM-dd HH:mm:ss");
    var firstName = (data.firstName || data.name || "Educator").trim();
    var email = (data.email || "").trim();
    var primaryRole = (data.primaryRole || data.role || "General Educator").trim();
    var source = data.source || "CurriculumAI Free Blueprint Landing Page";

    if (!email) {
      return ContentService
        .createTextOutput(JSON.stringify({ result: "error", message: "Email is required" }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // Append lead to spreadsheet
    // Columns: Timestamp, First Name, Email, Role, Source, Lead Magnet Sent, Follow-Up 1, Follow-Up 2, Follow-Up 3, Notes
    sheet.appendRow([
      timestampStr,
      firstName,
      email,
      primaryRole,
      source,
      "Yes", // Lead Magnet Sent (Email 1)
      "No",  // Follow-Up 1 (Day 2)
      "No",  // Follow-Up 2 (Day 5)
      "No",  // Follow-Up 3 (Day 8 - Pro Offer)
      "Automated lead capture"
    ]);

    // EMAIL 1: Immediate Blueprint Delivery
    sendEmail1_Welcome(email, firstName);

    // Admin alert for high-priority leads
    sendAdminAlert(ss, firstName, email, primaryRole, timestampStr, source);

    // Ensure daily background trigger is running
    ensureDailyTrigger();

    return ContentService
      .createTextOutput(JSON.stringify({ result: "success", email: email }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    Logger.log("doPost Error: " + error.toString());
    return ContentService
      .createTextOutput(JSON.stringify({ result: "error", error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  return ContentService.createTextOutput("CurriculumAI Lead Automation & Drip Webhook is active.");
}


// =========================================================================
// EMAIL SEQUENCE TEMPLATES & DISPATCHERS
// =========================================================================

// EMAIL 1 (Instant): Blueprint PDF Delivery
function sendEmail1_Welcome(email, firstName) {
  var pdfUrl = "https://curriculumaipro.com/AI_Curriculum_Blueprint_v4.2.pdf";
  var subject = "Your Free AI Curriculum Blueprint (Download Link Inside)";
  
  var htmlBody = "<div style='font-family:-apple-system,BlinkMacSystemFont,\"Segoe UI\",Roboto,sans-serif;max-width:600px;margin:0 auto;line-height:1.6;color:#1e293b;'>" +
    "<h2 style='color:#0f172a;margin-bottom:8px;'>Your Free AI Curriculum Blueprint is Ready</h2>" +
    "<p style='font-size:16px;'>Hi <strong>" + firstName + "</strong>,</p>" +
    "<p style='font-size:15px;'>Thank you for requesting the <em>AI Curriculum Architecture & Course Design Blueprint v4.2</em>. Your guide is available for immediate download below:</p>" +
    "<div style='margin:28px 0;text-align:center;'>" +
    "<a href='" + pdfUrl + "' style='background-color:#2563eb;color:#ffffff;padding:14px 28px;text-decoration:none;border-radius:8px;font-weight:600;font-size:16px;display:inline-block;'>Download Free Blueprint (PDF)</a>" +
    "</div>" +
    "<p style='font-size:14px;color:#334155;'><strong>What's inside your 42-page package:</strong></p>" +
    "<ul style='font-size:14px;color:#475569;padding-left:20px;'>" +
    "<li><strong>Module 01:</strong> Backward Design Prompt Matrix (Wiggins & McTighe)</li>" +
    "<li><strong>Module 02:</strong> Bloom's Revised Taxonomy AI Engine</li>" +
    "<li><strong>Module 03:</strong> 50+ Modular System Prompts for Syllabi, Readings & Rubrics</li>" +
    "<li><strong>Module 04:</strong> Accreditation & Rubric Protocol (ABET, AACSB, HLC)</li>" +
    "</ul>" +
    "<hr style='border:none;border-top:1px solid #e2e8f0;margin:28px 0;' />" +
    "<h3 style='color:#0f172a;font-size:16px;margin-bottom:8px;'>Want to Turn This Blueprint into Full Courses Automatically?</h3>" +
    "<p style='font-size:14px;color:#475569;'>With <a href='https://curriculumaipro.com' style='color:#2563eb;text-decoration:underline;'>CurriculumAI</a>, you can generate complete accredited syllabi, weekly reading modules, socratic discussions, and Canvas LMS files in minutes.</p>" +
    "<p style='background-color:#f8fafc;border-left:4px solid:#2563eb;padding:12px 16px;margin:16px 0;font-size:14px;color:#1e293b;'>" +
    "<strong>Special Educator Tier:</strong> Generate 3 complete courses per month at zero cost. <a href='https://curriculumaipro.com' style='color:#2563eb;font-weight:600;'>Try CurriculumAI Free &rarr;</a>" +
    "</p>" +
    "<p style='color:#64748b;font-size:13px;margin-top:32px;'>Best regards,<br/><strong>Mikey & The CurriculumAI Team</strong><br/><a href='https://curriculumaipro.com' style='color:#64748b;'>curriculumaipro.com</a></p>" +
    "</div>";

  GmailApp.sendEmail(email, subject, "Download your blueprint at " + pdfUrl, {
    name: "CurriculumAI",
    htmlBody: htmlBody
  });
}

// EMAIL 2 (Day 2): Backward Design in Action (Value Add)
function sendEmail2_BackwardDesign(email, firstName) {
  var subject = "How to build a 15-week syllabus in 2 minutes (Backward Design)";
  
  var htmlBody = "<div style='font-family:-apple-system,BlinkMacSystemFont,\"Segoe UI\",Roboto,sans-serif;max-width:600px;margin:0 auto;line-height:1.6;color:#1e293b;'>" +
    "<h2 style='color:#0f172a;'>Module 01 Deep-Dive: Backward Design</h2>" +
    "<p>Hi <strong>" + firstName + "</strong>,</p>" +
    "<p>When most educators build a new course, they start with the textbook or the reading list. But top curriculum committees and instructional designers use <strong>Backward Design (Wiggins & McTighe)</strong>:</p>" +
    "<ol style='font-size:14px;color:#334155;padding-left:20px;'>" +
    "<li><strong>Identify Desired Results:</strong> What should students remember 3 years from now?</li>" +
    "<li><strong>Determine Acceptable Evidence:</strong> What authentic capstone or simulation proves mastery?</li>" +
    "<li><strong>Plan Learning Experiences:</strong> What readings and exercises scaffold that outcome?</li>" +
    "</ol>" +
    "<p>In your downloaded blueprint, Module 01 contains our master prompt template to automate this scaffolding.</p>" +
    "<p>Or, you can run this instantly on <a href='https://curriculumaipro.com' style='color:#2563eb;font-weight:600;'>CurriculumAI</a>. Simply input your course topic and target student level, and our AI generates the full 15-week modular syllabus in under 2 minutes.</p>" +
    "<div style='margin:25px 0;'>" +
    "<a href='https://curriculumaipro.com' style='background-color:#2563eb;color:#ffffff;padding:12px 24px;text-decoration:none;border-radius:6px;font-weight:600;display:inline-block;'>Generate a Course Outline Free</a>" +
    "</div>" +
    "<p style='color:#64748b;font-size:13px;'>Best,<br/>Mikey & The CurriculumAI Team</p>" +
    "</div>";

  GmailApp.sendEmail(email, subject, "Learn how to use Backward Design with CurriculumAI at https://curriculumaipro.com", {
    name: "CurriculumAI",
    htmlBody: htmlBody
  });
}

// EMAIL 3 (Day 5): Bloom's Taxonomy & Authentic Assessments
function sendEmail3_BloomsTaxonomy(email, firstName) {
  var subject = "Beyond multiple choice: Bloom's cognitive matrices for AI courses";
  
  var htmlBody = "<div style='font-family:-apple-system,BlinkMacSystemFont,\"Segoe UI\",Roboto,sans-serif;max-width:600px;margin:0 auto;line-height:1.6;color:#1e293b;'>" +
    "<h2 style='color:#0f172a;'>Elevating Cognitive Depth with Bloom's Taxonomy</h2>" +
    "<p>Hi <strong>" + firstName + "</strong>,</p>" +
    "<p>One of the biggest complaints faculty have about AI-generated lesson plans is surface-level content: generic quizzes, multiple-choice questions, and rote recall.</p>" +
    "<p>Module 02 in your blueprint fixes this by forcing AI prompts through <strong>Bloom's Higher-Order Thinking Levels (4–6)</strong>:</p>" +
    "<ul style='font-size:14px;color:#334155;padding-left:20px;'>" +
    "<li><strong>Level 4 (Analyze):</strong> Contrasting competing models and diagnosing structural flaws.</li>" +
    "<li><strong>Level 5 (Evaluate):</strong> Peer rubric audits and defended methodological critiques.</li>" +
    "<li><strong>Level 6 (Create):</strong> Original capstone architecture and real-world executive briefs.</li>" +
    "</ul>" +
    "<p>CurriculumAI bakes these cognitive matrices directly into every generated module so your courses meet institutional audit and accreditation standards right out of the box.</p>" +
    "<div style='margin:25px 0;'>" +
    "<a href='https://curriculumaipro.com' style='background-color:#0f172a;color:#ffffff;padding:12px 24px;text-decoration:none;border-radius:6px;font-weight:600;display:inline-block;'>Explore CurriculumAI Modules</a>" +
    "</div>" +
    "<p style='color:#64748b;font-size:13px;'>Best,<br/>Mikey & The CurriculumAI Team</p>" +
    "</div>";

  GmailApp.sendEmail(email, subject, "Explore authentic assessment generation at https://curriculumaipro.com", {
    name: "CurriculumAI",
    htmlBody: htmlBody
  });
}

// EMAIL 4 (Day 8): Pro Tier & Canvas LMS Export Offer ($29.99/mo)
function sendEmail4_ProOffer(email, firstName) {
  var stripeUrl = "https://buy.stripe.com/aFa6oA3rd5ODcDJ0895sA01";
  var subject = "Ready for unlimited courses & Canvas LMS export? (CurriculumAI Pro)";
  
  var htmlBody = "<div style='font-family:-apple-system,BlinkMacSystemFont,\"Segoe UI\",Roboto,sans-serif;max-width:600px;margin:0 auto;line-height:1.6;color:#1e293b;'>" +
    "<h2 style='color:#0f172a;'>Take Your Course Architecture to the Next Level</h2>" +
    "<p>Hi <strong>" + firstName + "</strong>,</p>" +
    "<p>Over the past week, you've seen how CurriculumAI combines pedagogical rigor with the speed of AI.</p>" +
    "<p>If you're managing multiple programs, training tracks, or semester courses, <strong>CurriculumAI Pro</strong> gives you the complete toolkit:</p>" +
    "<div style='background-color:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:20px;margin:20px 0;'>" +
    "<div style='font-size:18px;font-weight:700;color:#0f172a;'>CurriculumAI Pro &bull; $29.99/mo</div>" +
    "<ul style='font-size:14px;color:#334155;padding-left:20px;margin-top:12px;line-height:1.8;'>" +
    "<li><strong>Unlimited Curricula:</strong> Never hit monthly generation limits</li>" +
    "<li><strong>Up to 20 Modules per Course:</strong> Handle full 16-week terms + capstones</li>" +
    "<li><strong>JSON & CSV LMS Export:</strong> Instant import into Canvas, Blackboard, or Moodle</li>" +
    "<li><strong>Advanced AI Models:</strong> Higher pedagogical fidelity and zero generic filler</li>" +
    "<li><strong>Curriculum Version History:</strong> Save, branch, and iterate course roadmaps</li>" +
    "<li><strong>Priority Support:</strong> Direct assistance from our product team</li>" +
    "</ul>" +
    "<div style='margin-top:18px;text-align:center;'>" +
    "<a href='" + stripeUrl + "' style='background-color:#2563eb;color:#ffffff;padding:14px 28px;text-decoration:none;border-radius:8px;font-weight:700;font-size:16px;display:inline-block;'>Start Your Pro Subscription ($29.99/mo) &rarr;</a>" +
    "</div>" +
    "</div>" +
    "<p style='font-size:13px;color:#64748b;'>Cancel anytime with one click. No long-term commitments.</p>" +
    "<p style='color:#64748b;font-size:13px;margin-top:28px;'>Best regards,<br/><strong>Mikey & The CurriculumAI Team</strong><br/><a href='https://curriculumaipro.com' style='color:#64748b;'>curriculumaipro.com</a></p>" +
    "</div>";

  GmailApp.sendEmail(email, subject, "Upgrade to CurriculumAI Pro at " + stripeUrl, {
    name: "CurriculumAI",
    htmlBody: htmlBody
  });
}


// =========================================================================
// 2. DAILY AUTOMATED DRIP RUNNER
// Runs automatically every day to check lead age and send scheduled follow-ups
// =========================================================================

function runDailyLeadFollowUp() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = getOrCreateSubscribersSheet(ss);
  var data = sheet.getDataRange().getValues();

  if (data.length <= 1) return; // Only headers

  var now = new Date();
  var headers = data[0];

  // Map header indexes
  var colTimestamp = 0;
  var colFirstName = 1;
  var colEmail = 2;
  var colFollowUp1 = 6;
  var colFollowUp2 = 7;
  var colFollowUp3 = 8;

  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var timestampStr = row[colTimestamp];
    var firstName = row[colFirstName] || "Educator";
    var email = row[colEmail];
    var fu1 = row[colFollowUp1];
    var fu2 = row[colFollowUp2];
    var fu3 = row[colFollowUp3];

    if (!email || !timestampStr) continue;

    var signupDate = new Date(timestampStr);
    if (isNaN(signupDate.getTime())) continue;

    var diffDays = Math.floor((now.getTime() - signupDate.getTime()) / (1000 * 60 * 60 * 24));

    // Day 2 Follow-Up: Backward Design
    if (diffDays >= 2 && fu1 !== "Yes") {
      try {
        sendEmail2_BackwardDesign(email, firstName);
        sheet.getRange(i + 1, colFollowUp1 + 1).setValue("Yes");
        Utilities.sleep(1000);
      } catch (e) {
        Logger.log("FU1 failed for " + email + ": " + e.toString());
      }
    }

    // Day 5 Follow-Up: Bloom's Taxonomy
    if (diffDays >= 5 && fu2 !== "Yes") {
      try {
        sendEmail3_BloomsTaxonomy(email, firstName);
        sheet.getRange(i + 1, colFollowUp2 + 1).setValue("Yes");
        Utilities.sleep(1000);
      } catch (e) {
        Logger.log("FU2 failed for " + email + ": " + e.toString());
      }
    }

    // Day 8 Follow-Up: Pro Plan Offer ($29.99/mo)
    if (diffDays >= 8 && fu3 !== "Yes") {
      try {
        sendEmail4_ProOffer(email, firstName);
        sheet.getRange(i + 1, colFollowUp3 + 1).setValue("Yes");
        Utilities.sleep(1000);
      } catch (e) {
        Logger.log("FU3 failed for " + email + ": " + e.toString());
      }
    }
  }
}


// =========================================================================
// HELPER FUNCTIONS & TRIGGER SETUP
// =========================================================================

function getOrCreateSubscribersSheet(ss) {
  var sheet = ss.getSheetByName("Subscribers");
  if (!sheet) {
    sheet = ss.getSheets()[0];
    sheet.setName("Subscribers");
  }

  // Ensure header row has follow-up columns
  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      "Timestamp",
      "First Name",
      "Email Address",
      "Primary Role",
      "Lead Source",
      "Lead Magnet Sent",
      "Follow-Up 1 (Day 2)",
      "Follow-Up 2 (Day 5)",
      "Follow-Up 3 (Day 8 - Pro)",
      "Notes"
    ]);
  } else {
    var headers = sheet.getRange(1, 1, 1, Math.max(10, sheet.getLastColumn())).getValues()[0];
    if (headers.length < 10 || !headers[6]) {
      sheet.getRange(1, 1, 1, 10).setValues([[
        headers[0] || "Timestamp",
        headers[1] || "First Name",
        headers[2] || "Email Address",
        headers[3] || "Primary Role",
        headers[4] || "Lead Source",
        headers[5] || "Lead Magnet Sent",
        "Follow-Up 1 (Day 2)",
        "Follow-Up 2 (Day 5)",
        "Follow-Up 3 (Day 8 - Pro)",
        "Notes"
      ]]);
    }
  }
  return sheet;
}

function sendAdminAlert(ss, firstName, email, primaryRole, timestampStr, source) {
  try {
    var lower = primaryRole.toLowerCase();
    var isPriority = lower.indexOf("higher ed") !== -1 ||
                     lower.indexOf("faculty") !== -1 ||
                     lower.indexOf("corporate") !== -1 ||
                     lower.indexOf("director") !== -1;

    var subject = (isPriority ? "⭐ [Priority Lead] " : "[New Lead] ") + firstName + " (" + primaryRole + ")";
    var body = "A new subscriber registered on CurriculumAI:\n\n" +
      "• Name: " + firstName + "\n" +
      "• Email: " + email + "\n" +
      "• Role: " + primaryRole + "\n" +
      "• Time: " + timestampStr + "\n" +
      "• Source: " + source + "\n\n" +
      "Spreadsheet: " + ss.getUrl();

    GmailApp.sendEmail("2js9021@gmail.com", subject, body, {
      name: "CurriculumAI Lead Bot"
    });
  } catch (err) {
    Logger.log("Admin alert error: " + err.toString());
  }
}

// Automatically creates a daily 9am trigger if one doesn't exist yet
function ensureDailyTrigger() {
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === "runDailyLeadFollowUp") {
      return; // Already configured
    }
  }
  ScriptApp.newTrigger("runDailyLeadFollowUp")
    .timeBased()
    .everyDays(1)
    .atHour(9)
    .create();
}
