-- Run this once in the Supabase SQL editor (Project > SQL Editor > New query)

create table if not exists applicants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  phone text,
  program text,
  stage text not null default 'inquiry' check (stage in ('inquiry','application','outreach','decision','enrolled')),
  stage_date date not null default current_date,
  last_contact date,
  next_followup date,
  decision text check (decision in ('pending','accepted','denied','waitlisted') or decision is null),
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists contact_log (
  id uuid primary key default gen_random_uuid(),
  applicant_id uuid not null references applicants(id) on delete cascade,
  entry text not null,
  created_at timestamptz not null default now()
);

create table if not exists templates (
  id uuid primary key default gen_random_uuid(),
  stage text not null check (stage in ('inquiry','application','outreach','decision','enrolled')),
  title text not null,
  body text not null,
  created_at timestamptz not null default now()
);

-- Seed a starter template for each stage so the library isn't empty on first load.
insert into templates (stage, title, body) values
('inquiry', 'New inquiry response', 'Hi [Name],

Thanks so much for your interest in [Program]! I''d love to help you get started. Here''s what to expect next: [steps].

Feel free to reply here with any questions, or grab time on my calendar: [link].

Best,
[Your name]'),
('application', 'Application incomplete nudge', 'Hi [Name],

Just checking in, your application is almost there! You''re still missing: [missing items].

Let me know if you run into any trouble submitting, happy to help.

Best,
[Your name]'),
('outreach', 'Post-application check-in', 'Hi [Name],

Thanks for submitting your application! We''re currently reviewing it and you can expect to hear back by [date].

In the meantime, feel free to reach out with any questions.

Best,
[Your name]'),
('decision', 'Decision notification', 'Hi [Name],

We wanted to follow up on your application. [Decision details].

[Next steps]. Let me know if you''d like to talk it through.

Best,
[Your name]'),
('enrolled', 'Enrollment welcome', 'Hi [Name],

Welcome aboard! We''re excited to have you join us. Here''s what to expect before your start date: [steps].

Reach out anytime, happy to help.

Best,
[Your name]')
on conflict do nothing;
