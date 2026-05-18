import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  roleId: text("role_id").notNull(),
  roleTitle: text("role_title").notNull(),
  candidateName: text("candidate_name"),
  resumeAnalysis: text("resume_analysis"), // JSON string
  questions: text("questions"), // JSON string
  metrics: text("metrics"), // JSON string
  verdict: text("verdict"), // JSON string
  shadowQuestions: text("shadow_questions"), // JSON string
  improvementPlan: text("improvement_plan"), // JSON string
  status: text("status").notNull().default("setup"), // setup | calibrating | interviewing | complete
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  completedAt: integer("completed_at", { mode: "timestamp" }),
});
