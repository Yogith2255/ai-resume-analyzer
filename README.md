# CareerLens — AI Resume Analyzer MVP

A no-dependency browser prototype for the first three product areas:

- Registration/sign-in plus replaceable resume metadata and skills profile
- Resume-aware job matching dashboard with ATS-style scores
- Job-description coach with skill-gap and project guidance

## Run it

Open `index.html` in a browser. The prototype stores its data in browser local storage, so it needs no server or API keys.

## Production integration path

1. Replace local storage with authenticated users and encrypted resume storage (for example, Supabase/Auth0 plus S3 or Supabase Storage).
2. Extract text from uploaded PDF/DOCX resumes server-side and calculate embeddings/ATS matching there.
3. Use licensed job feeds or the providers' official partner APIs. Avoid unapproved scraping of LinkedIn, Naukri, or Indeed; their terms and anti-bot controls generally prohibit it.
4. Add an LLM server endpoint for the coach and make company research use approved, cited web/news search sources.

## Supabase setup started

The project now includes [supabase/schema.sql](supabase/schema.sql), which creates private user profiles, resume metadata, and a private `resumes` storage bucket. It also enables row-level security so a signed-in user can only access their own data and files.

1. Create a new Supabase project.
2. Open **SQL Editor**, paste and run `supabase/schema.sql`.
3. Copy `.env.example` to `.env.local`, then add the project URL and publishable/anon key from the Supabase dashboard.
4. Do not share or commit the `service_role` key.

The current browser-only prototype will be converted to a React/Next.js app before connecting these credentials, so its UI stays intact while sign-in and uploads become real.
