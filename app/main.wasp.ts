import { app, page, route, query, action, job, api } from "@wasp.sh/spec";
import { App } from "./src/client/App" with { type: "ref" };
import {
  Landing,
  DesignPreview,
  Info,
  Demo,
  Workspace,
  EditorPage,
  AuthPage,
} from "./src/studio/pages" with { type: "ref" };
import {
  getStudio,
  mutateStudio,
  contact,
  getPublicConfig,
} from "./src/server/operations" with { type: "ref" };
import { executeAI } from "./src/server/aiTasks" with { type: "ref" };
import { extractSource } from "./src/server/files" with { type: "ref" };
import { middleware, health } from "./src/server/setup" with { type: "ref" };
import {
  getEmailUserFields,
  verificationEmail,
  resetEmail,
} from "./src/auth/config" with { type: "ref" };
const entities = [
  "User",
  "Project",
  "ProjectMember",
  "Document",
  "DocumentRevision",
  "Source",
  "SourceChunk",
  "DocumentSource",
  "Citation",
  "EvidenceLink",
  "AIJob",
  "UsageEvent",
  "ContactMessage",
  "Proposal",
  "Blueprint",
  "ThesisSection",
  "VerificationEvent",
  "Comment",
  "Claim",
  "ClaimAssessment",
  "ReviewEvent",
] as const;
export default app({
  name: "Bakalio",
  wasp: { version: "0.26.1" },
  title: "Bakalio",
  head: [
    "<meta name='description' content='A thoughtful workspace for your research, sources and writing.' />",
    "<link rel='icon' href='/icon.svg' />",
    "<link rel='manifest' href='/manifest.webmanifest' />",
  ],
  client: { rootComponent: App },
  server: { middlewareConfigFn: middleware },
  auth: {
    userEntity: "User",
    methods: {
      email: {
        userSignupFields: getEmailUserFields,
        fromField: {
          name: "Bakalio",
          email: "research@localhost.test",
        },
        emailVerification: {
          clientRoute: "VerifyRoute",
          getEmailContentFn: verificationEmail,
        },
        passwordReset: {
          clientRoute: "ResetRoute",
          getEmailContentFn: resetEmail,
        },
      },
    },
    onAuthFailedRedirectTo: "/login",
    onAuthSucceededRedirectTo: "/app",
  },
  emailSender: {
    provider: "SMTP",
    defaultFrom: { name: "Bakalio", email: "research@localhost.test" },
  },
  spec: [
    route("DesignPreview", "/design-preview", page(DesignPreview)),
    route("Home", "/", page(Landing), { prerender: true }),
    route("CsHome", "/cs", page(Landing), { prerender: true }),
    route("EnHome", "/en", page(Landing), { prerender: true }),
    route("ZhHome", "/zh", page(Landing), { prerender: true }),
    route("csFeatures", "/cs/features", page(Info), { prerender: true }),
    route("csWorkflow", "/cs/workflow", page(Info), { prerender: true }),
    route("csPricing", "/cs/pricing", page(Info), { prerender: true }),
    route("csFaq", "/cs/faq", page(Info), { prerender: true }),
    route("csSupport", "/cs/support", page(Info), { prerender: true }),
    route("csPrivacy", "/cs/privacy", page(Info), { prerender: true }),
    route("csTerms", "/cs/terms", page(Info), { prerender: true }),
    route("enFeatures", "/en/features", page(Info), { prerender: true }),
    route("enWorkflow", "/en/workflow", page(Info), { prerender: true }),
    route("enPricing", "/en/pricing", page(Info), { prerender: true }),
    route("enFaq", "/en/faq", page(Info), { prerender: true }),
    route("enSupport", "/en/support", page(Info), { prerender: true }),
    route("enPrivacy", "/en/privacy", page(Info), { prerender: true }),
    route("enTerms", "/en/terms", page(Info), { prerender: true }),
    route("zhFeatures", "/zh/features", page(Info), { prerender: true }),
    route("zhWorkflow", "/zh/workflow", page(Info), { prerender: true }),
    route("zhPricing", "/zh/pricing", page(Info), { prerender: true }),
    route("zhFaq", "/zh/faq", page(Info), { prerender: true }),
    route("zhSupport", "/zh/support", page(Info), { prerender: true }),
    route("zhPrivacy", "/zh/privacy", page(Info), { prerender: true }),
    route("zhTerms", "/zh/terms", page(Info), { prerender: true }),
    route("Demo", "/demo", page(Demo)),
    route("Workspace", "/app", page(Workspace, { authRequired: true })),
    route(
      "WorkspaceSection",
      "/app/:section",
      page(Workspace, { authRequired: true }),
    ),
    route(
      "Editor",
      "/project/:projectId/:documentId",
      page(EditorPage, { authRequired: true }),
    ),
    route("Login", "/login", page(AuthPage)),
    route("Signup", "/signup", page(AuthPage)),
    route("Forgot", "/forgot", page(AuthPage)),
    route("VerifyRoute", "/verify", page(AuthPage)),
    route("ResetRoute", "/reset", page(AuthPage)),
    query(getPublicConfig, { auth: false }),
    query(getStudio, { entities: [...entities] }),
    action(mutateStudio, { entities: [...entities] }),
    action(contact, { entities: ["ContactMessage"] }),
    job(executeAI, {
      executor: "PgBoss",
      entities: ["AIJob", "ThesisSection", "UsageEvent"],
    }),
    job(extractSource, {
      executor: "PgBoss",
      entities: ["Source", "SourceChunk"],
    }),
    api("GET", "/health", health, { auth: false }),
  ],
});
