CREATE TYPE "public"."referral_agency" AS ENUM('barangay', 'vawc', 'pnp_acg', 'nbi_cybercrime');--> statement-breakpoint
CREATE TYPE "public"."referral_severity" AS ENUM('routine', 'moderate', 'severe', 'critical');--> statement-breakpoint
CREATE TYPE "public"."referral_status" AS ENUM('referred', 'accepted', 'investigation_active', 'concurred', 'completed');--> statement-breakpoint
ALTER TYPE "public"."user_role" ADD VALUE 'authority';--> statement-breakpoint
CREATE TABLE "case_directives" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"case_id" uuid NOT NULL,
	"referral_id" uuid NOT NULL,
	"author_id" text NOT NULL,
	"author_agency" "referral_agency" NOT NULL,
	"action_type" text NOT NULL,
	"directives" text NOT NULL,
	"urgency" text DEFAULT 'standard' NOT NULL,
	"investigation_milestone" text,
	"university_acknowledgment" text DEFAULT 'pending' NOT NULL,
	"university_remarks" text,
	"concurrence" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "case_directives" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "case_referrals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"case_id" uuid NOT NULL,
	"referred_by" text NOT NULL,
	"target_agency" "referral_agency" NOT NULL,
	"severity" "referral_severity" DEFAULT 'routine' NOT NULL,
	"referral_reason" text NOT NULL,
	"status" "referral_status" DEFAULT 'referred' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "case_referrals" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "agency" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "badge_or_credentials" text;--> statement-breakpoint
ALTER TABLE "case_directives" ADD CONSTRAINT "case_directives_case_id_cases_id_fk" FOREIGN KEY ("case_id") REFERENCES "public"."cases"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "case_directives" ADD CONSTRAINT "case_directives_referral_id_case_referrals_id_fk" FOREIGN KEY ("referral_id") REFERENCES "public"."case_referrals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "case_directives" ADD CONSTRAINT "case_directives_author_id_user_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "case_referrals" ADD CONSTRAINT "case_referrals_case_id_cases_id_fk" FOREIGN KEY ("case_id") REFERENCES "public"."cases"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "case_referrals" ADD CONSTRAINT "case_referrals_referred_by_user_id_fk" FOREIGN KEY ("referred_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "case_directives_case_idx" ON "case_directives" USING btree ("case_id");--> statement-breakpoint
CREATE INDEX "case_directives_referral_idx" ON "case_directives" USING btree ("referral_id");--> statement-breakpoint
CREATE INDEX "case_referrals_case_idx" ON "case_referrals" USING btree ("case_id");--> statement-breakpoint
CREATE INDEX "case_referrals_agency_idx" ON "case_referrals" USING btree ("target_agency");