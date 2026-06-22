-- Vues SQL pour les KPI du dashboard (calcul en direct, v1).
-- À exécuter après les migrations Drizzle : npm run db:views

-- Nombre d'agents par utilisateur (agents utilisateur uniquement, hors locaux)
CREATE OR REPLACE VIEW v_agent_usage AS
SELECT
  u.id                              AS user_id,
  COUNT(a.id) FILTER (WHERE a.is_local = false) AS agent_count
FROM "user" u
LEFT JOIN agent a ON a.user_id = u.id
GROUP BY u.id;

-- Messages par jour et par utilisateur (30 derniers jours)
CREATE OR REPLACE VIEW v_messages_daily AS
SELECT
  c.user_id                        AS user_id,
  date_trunc('day', m.created_at)  AS day,
  COUNT(*)                         AS message_count
FROM message m
JOIN conversation c ON c.id = m.conversation_id
GROUP BY c.user_id, date_trunc('day', m.created_at);

-- Répartition des messages par agent et par utilisateur
CREATE OR REPLACE VIEW v_messages_per_agent AS
SELECT
  c.user_id        AS user_id,
  a.id             AS agent_id,
  a.name           AS agent_name,
  COUNT(m.id)      AS message_count
FROM conversation c
LEFT JOIN agent a   ON a.id = c.agent_id
LEFT JOIN message m ON m.conversation_id = c.id
GROUP BY c.user_id, a.id, a.name;

-- Compteurs globaux par utilisateur (conversations, messages, fichiers)
CREATE OR REPLACE VIEW v_user_overview AS
SELECT
  u.id AS user_id,
  (SELECT COUNT(*) FROM conversation c WHERE c.user_id = u.id) AS conversation_count,
  (SELECT COUNT(*) FROM message m
     JOIN conversation c ON c.id = m.conversation_id
     WHERE c.user_id = u.id) AS message_count,
  (SELECT COUNT(*) FROM file f WHERE f.user_id = u.id) AS file_count
FROM "user" u;
