-- Limpiar todo primero
TRUNCATE TABLE reactions CASCADE;
TRUNCATE TABLE notifications CASCADE;
TRUNCATE TABLE secrets CASCADE;

-- Insertar 16 secretos principales
INSERT INTO secrets (content, category, created_at, view_count) VALUES
('A veces me arrepiento de mis decisiones pasadas pero no sé cómo enfrentarlas', 'confesiones', NOW() - INTERVAL '5 days', 8),
('Tengo miedo de que descubran que no sé lo que estoy haciendo en mi trabajo', 'confesiones', NOW() - INTERVAL '4 days 3 hours', 12),
('Extraño a alguien que no debería extrañar. Hace 2 años que no hablamos', 'confesiones', NOW() - INTERVAL '3 days 8 hours', 15),
('A veces finjo estar bien pero internamente estoy destrozado', 'confesiones', NOW() - INTERVAL '2 days 10 hours', 22),
('Si no sabes qué hacer con tu vida, empieza por ayudar a alguien más. Te sorprenderá lo que encuentras', 'consejos', NOW() - INTERVAL '4 days 5 hours', 18),
('No ignores tus emociones negativas. Siéntelas, entiéndelas, déjalas ir. Es el único camino real', 'consejos', NOW() - INTERVAL '3 days 12 hours', 25),
('La gente que te ama de verdad se quedará incluso cuando todo sea caótico', 'consejos', NOW() - INTERVAL '2 days 6 hours', 19),
('Pequeños pasos consistentes son mejor que grandes cambios que no puedes mantener', 'consejos', NOW() - INTERVAL '1 day 14 hours', 11),
('Hace unos meses conocí a alguien en un café. Nunca supimos ni el nombre del otro pero esa conversación cambió mi perspectiva de todo', 'historias', NOW() - INTERVAL '5 days 2 hours', 28),
('Mi abuelo me dejó una carta antes de morir. Tardé 3 años en tener el valor de leerla', 'historias', NOW() - INTERVAL '3 days 18 hours', 35),
('Perdí mi trabajo el mismo día que me mudé a una ciudad nueva. Fue el mejor accidente de mi vida', 'historias', NOW() - INTERVAL '2 days 4 hours', 16),
('¿Cómo sé si estoy donde debería estar o solo he dejado que la vida me lleve?', 'preguntas', NOW() - INTERVAL '4 days 7 hours', 13),
('¿Es normal sentir que no encajas en ningún lado aunque tengas gente que te ame?', 'preguntas', NOW() - INTERVAL '1 day 20 hours', 20),
('¿A qué edad dejas de esperar que todo tenga sentido?', 'preguntas', NOW() - INTERVAL '6 hours', 7),
('Hoy hice algo que estaba aterrado de hacer y sobreviví. No cambió el mundo pero cambió mi día', 'general', NOW() - INTERVAL '5 days 11 hours', 32),
('Es raro cómo la gente que más te importa puede hablarte como si nada en un momento y al otro hacerte sentir invisible', 'general', NOW() - INTERVAL '1 day 2 hours', 24);

-- Insertar reacciones (UNA por tipo de reacción por secreto - constraint UNIQUE)
INSERT INTO reactions (secret_id, type) VALUES
(1, 'fire'), (1, 'heart'),
(2, 'fire'), (2, 'heart'),
(3, 'heart'), (3, 'fire'),
(4, 'fire'), (4, 'heart'),
(5, 'fire'), (5, 'heart'),
(6, 'heart'), (6, 'fire'),
(7, 'heart'), (7, 'fire'),
(8, 'heart'), (8, 'fire'),
(9, 'fire'), (9, 'heart'),
(10, 'heart'), (10, 'fire'),
(11, 'fire'), (11, 'heart'),
(12, 'heart'), (12, 'fire'),
(13, 'fire'), (13, 'heart'),
(14, 'heart'), (14, 'fire'),
(15, 'fire'), (15, 'heart'),
(16, 'fire'), (16, 'heart');

-- Insertar respuestas/replies
INSERT INTO secrets (content, parent_id, category, created_at, is_admin_post) VALUES
('Exacto, y lo importante es que lo reconoces. Eso ya es un primer paso grande', 1, 'general', NOW() - INTERVAL '4 days 23 hours', FALSE),
('Me pasó lo mismo pero un día me di cuenta de que estaba fingiendo tener todas las respuestas', 2, 'general', NOW() - INTERVAL '4 days 20 hours', FALSE),
('Si ese miedo que describes lo compartiera con mi jefe probablemente sería despedido, así que lo guardo aquí', 2, 'general', NOW() - INTERVAL '4 days 15 hours', FALSE),
('Eso que dices de pequeños pasos es verdad. Cambié mi vida de esa forma', 8, 'general', NOW() - INTERVAL '2 days 18 hours', FALSE),
('Me encantó tu historia del café. Esas conexiones son las que hacen la vida real', 9, 'general', NOW() - INTERVAL '3 days 14 hours', FALSE),
('¿Cómo te fue después de perder el trabajo? En serio necesito escuchar historias donde todo sale bien', 11, 'general', NOW() - INTERVAL '2 days 8 hours', FALSE);
