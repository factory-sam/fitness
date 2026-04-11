# Glossary

| Term | Definition |
|---|---|
| **S/W ratio** | Shoulder-to-waist ratio. The primary physique metric in Vitruvian, displayed as the dashboard hero. The classical ideal target is 1.618 (golden ratio). Calculated from shoulder and waist circumference measurements stored in the `measurements` table. |
| **RPE** | Rate of Perceived Exertion. A 1–10 subjective intensity scale logged per set. Used to track effort without relying solely on weight. |
| **PR** | Personal Record. The heaviest weight or best performance achieved for an exercise. Tracked in the `milestones` table and surfaced in the exercise library. |
| **RLS** | Row-Level Security. Postgres feature used on every table to ensure queries only return rows where `auth.uid() = user_id`. Enforced at the database level, not in application code. |
| **Block** | A 4-week training phase within a periodised programme. Programme days and exercises are organised by block in the `programme_days` and `programme_exercises` tables. |
| **Superset** | Two exercises performed back-to-back with no rest between them. Supported in the workout logger via superset grouping. |
| **Working weight** | The current training weight for a given exercise. Stored in the `working_weights` table and displayed alongside exercise details. Updated as the user progresses. |
| **Compliance** | Supplement adherence percentage. Calculated from entries in the `supplement_log` table against the configured supplements. Displayed on the dashboard and supplements page. |
