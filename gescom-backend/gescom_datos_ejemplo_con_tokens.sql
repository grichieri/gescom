-- =====================================================================
-- GESCOM - Datos de ejemplo para pruebas
--
-- Ejecutar DESPUÉS de gescom_tablas.sql, conectado a la base de datos gescom.
-- Se puede volver a ejecutar las veces que haga falta: vacía antes las tablas
-- (excepto provinces y cities) y reinicia los contadores.
-- Todos los datos son ficticios; los hashes de contraseña no son reales.
--
-- VERSIÓN PARA EL BACK CON CORREO (V1_1_0, tabla verification_tokens):
--   * El TRUNCATE incluye verification_tokens (apunta a users y, si no, Postgres no deja vaciar users).
--   * Al final se pone una contraseña real a todos los usuarios (el back compara en texto plano):
--     usuario laura.gomez@example.com (superadmin), contraseña Gescom@1234. Cámbiala si quieres otra.
--   * Se ejecuta con el back arrancado al menos una vez (Flyway ya ha creado las tablas):
--     docker exec -i gescom-postgres psql -U gescom_user_db -d gescom_db < gescom_datos_ejemplo_con_tokens.sql
--
-- Códigos numéricos:
--   users.type            1: Superadmin, 2: Usuario (administrador, presidente y conserje se asignan por comunidad)
--   users.resident_type   1: Propietario, 2: Inquilino
--   communities.type      1: Edificio, 2: Chalet
--   incidences.status     1: Pendiente, 2: En progreso, 3: Resuelto
--   incidences.priority   1: Baja, 2: Media, 3: Alta
-- =====================================================================

BEGIN;

TRUNCATE TABLE
    verification_tokens,
    incidence_pictures,
    incidence_comments,
    incidences,
    communities_caretakers,
    communities_presidents,
    communities_administrators,
    communities_users,
    properties,
    communities,
    users
RESTART IDENTITY;

-- ---------------------------------------------------------------------
-- users (1 superadmin y 15 usuarios; los roles de administrador, presidente y conserje salen de las tablas communities_*)
-- ---------------------------------------------------------------------
INSERT INTO users
    (user_id, name, lastname, type, resident_type, avatar, dni, phone_number, is_validated, is_active, is_disabled, email, password, address, zip_code, city_id) VALUES
    (1, 'Laura', 'Gómez Pérez', 1, NULL, 'avatars/laura.png', '12345711R', '600100001', true, true, false, 'laura.gomez@example.com', '$2b$10$EjemploHashFicticioSoloParaPruebas0000000000000000', 'Calle Larios 5, 3º', '29005', 3079),
    (2, 'Carlos', 'Ruiz Martín', 2, NULL, 'avatars/carlos.png', '12345822C', '600100002', true, true, false, 'carlos.ruiz@example.com', '$2b$10$EjemploHashFicticioSoloParaPruebas0000000000000000', 'Calle Alameda 12, 1º', '29012', 3079),
    (3, 'Marta', 'Sánchez López', 2, NULL, NULL, '12345933Q', '600100003', true, true, false, 'marta.sanchez@example.com', '$2b$10$EjemploHashFicticioSoloParaPruebas0000000000000000', 'Calle Real 8', '28013', 3535),
    (4, 'Antonio', 'Fernández Díaz', 2, 1, 'avatars/antonio.png', '12346044N', '600100004', true, true, false, 'antonio.fernandez@example.com', '$2b$10$EjemploHashFicticioSoloParaPruebas0000000000000000', 'Av. de la Luz 14, 2º B', '29001', 3079),
    (5, 'Lucía', 'Torres Navarro', 2, 2, NULL, '12346155P', '600100005', true, true, false, 'lucia.torres@example.com', '$2b$10$EjemploHashFicticioSoloParaPruebas0000000000000000', 'Av. de la Luz 14, 1º A', '29001', 3079),
    (6, 'Javier', 'Moreno Gil', 2, 1, NULL, '12346266G', '600100006', true, true, false, 'javier.moreno@example.com', '$2b$10$EjemploHashFicticioSoloParaPruebas0000000000000000', 'Av. de la Luz 16, 3º C', '29001', 3079),
    (7, 'Elena', 'Castro Ramos', 2, 1, 'avatars/elena.png', '12346377T', '600100007', true, true, false, 'elena.castro@example.com', '$2b$10$EjemploHashFicticioSoloParaPruebas0000000000000000', 'Calle Mayor 45, 4º A', '29002', 3079),
    (8, 'Pablo', 'Ortega Ruiz', 2, 2, NULL, '12346488L', '600100008', true, true, false, 'pablo.ortega@example.com', '$2b$10$EjemploHashFicticioSoloParaPruebas0000000000000000', 'Calle Mayor 45, 1º B', '29002', 3079),
    (9, 'Sofía', 'Jiménez Vega', 2, 1, NULL, '12346599S', '600100009', true, true, false, 'sofia.jimenez@example.com', '$2b$10$EjemploHashFicticioSoloParaPruebas0000000000000000', 'Calle Los Juncos 8', '29003', 3079),
    (10, 'Miguel Ángel', 'Serrano Cruz', 2, 1, NULL, '12346710B', '600100010', true, true, false, 'miguel.serrano@example.com', '$2b$10$EjemploHashFicticioSoloParaPruebas0000000000000000', 'Calle Los Juncos 10', '29003', 3079),
    (11, 'Carmen', 'Molina Reyes', 2, 2, NULL, '12346821F', '600100011', true, true, false, 'carmen.molina@example.com', '$2b$10$EjemploHashFicticioSoloParaPruebas0000000000000000', 'Paseo de la Castellana 120, 5º A', '28046', 3535),
    (12, 'David', 'Herrera Cano', 2, 1, 'avatars/david.png', '12346932A', '600100012', true, true, false, 'david.herrera@example.com', '$2b$10$EjemploHashFicticioSoloParaPruebas0000000000000000', 'Paseo de la Castellana 120, 2º C', '28046', 3535),
    (13, 'Isabel', 'Romero Blanco', 2, 1, NULL, '12347043E', '600100013', false, true, false, 'isabel.romero@example.com', '$2b$10$EjemploHashFicticioSoloParaPruebas0000000000000000', 'Calle Sierpes 20, 2º', '41004', 3958),
    (14, 'Raúl', 'Vargas Soto', 2, 2, NULL, '12347154H', '600100014', true, false, true, 'raul.vargas@example.com', '$2b$10$EjemploHashFicticioSoloParaPruebas0000000000000000', 'Calle Ribera 7', '29600', 3155),
    (15, 'Manuel', 'Iglesias Luque', 2, NULL, NULL, '12347265Z', '600100015', true, true, false, 'manuel.iglesias@example.com', '$2b$10$EjemploHashFicticioSoloParaPruebas0000000000000000', 'Calle Alameda 30, bajo', '29012', 3079),
    (16, 'Rosa', 'Delgado Pino', 2, NULL, NULL, '12347376X', '600100016', true, true, false, 'rosa.delgado@example.com', '$2b$10$EjemploHashFicticioSoloParaPruebas0000000000000000', 'Calle Toledo 14, bajo', '28005', 3535);

-- ---------------------------------------------------------------------
-- communities (la 5 está dada de baja: is_deleted = true; registration_code es el código de la URL de registro)
-- ---------------------------------------------------------------------
INSERT INTO communities
    (community_id, name, nif, type, address, zip_code, city_id, is_deleted, registration_code) VALUES
    (1, 'Residencial Las Flores', 'H29100001', 1, 'Av. de la Luz 14', '29001', 3079, false, '4c1c929e-115d-585a-b1ee-55537cafcd1c'),
    (2, 'Edificio Centro', 'H29100002', 1, 'Calle Mayor 45', '29002', 3079, false, '77153d26-796e-50bc-b9fe-1fcfeb6e7f2c'),
    (3, 'Urbanización El Pinar', 'H29100003', 2, 'Calle Los Juncos s/n', '29003', 3079, false, 'd136a300-dbbe-526e-b9ff-c1086db85bb8'),
    (4, 'Residencial Castellana', 'H28100004', 1, 'Paseo de la Castellana 120', '28046', 3535, false, '0400b063-5cd4-54b6-b584-676397ac3531'),
    (5, 'Edificio Antiguo (de baja)', 'H41100005', 1, 'Calle Cervantes 3', '41001', 3958, true, 'c63885a2-4ac0-585f-b643-26a1aca85fbc');

-- ---------------------------------------------------------------------
-- properties
-- ---------------------------------------------------------------------
INSERT INTO properties
    (property_id, community_id, block_portal, address, zip_code) VALUES
    (101, 1, 'Bloque A, Portal 1', 'Av. de la Luz 14, 2º B', '29001'),
    (102, 1, 'Bloque A, Portal 2', 'Av. de la Luz 14, 1º A', '29001'),
    (103, 1, 'Bloque B', 'Av. de la Luz 16, 3º C', '29001'),
    (201, 2, 'Portal 1', 'Calle Mayor 45, 4º A', '29002'),
    (202, 2, 'Portal 2', 'Calle Mayor 45, 1º B', '29002'),
    (301, 3, NULL, 'Calle Los Juncos 8', '29003'),
    (302, 3, NULL, 'Calle Los Juncos 10', '29003'),
    (401, 4, 'Torre Norte', 'Paseo de la Castellana 120, 5º A', '28046'),
    (402, 4, 'Torre Norte', 'Paseo de la Castellana 120, 2º C', '28046'),
    (501, 5, 'Portal 1', 'Calle Cervantes 3, 1º A', '41001');

-- ---------------------------------------------------------------------
-- communities_users (move_out_date NULL = sigue residiendo)
-- ---------------------------------------------------------------------
INSERT INTO communities_users
    (community_user_id, community_id, user_id, move_in_date, move_out_date) VALUES
    (1, 1, 4, '2019-03-01', NULL),
    (2, 1, 5, '2022-09-15', NULL),
    (3, 1, 6, '2018-06-20', NULL),
    (4, 1, 14, '2020-01-10', '2023-05-31'),
    (5, 2, 7, '2017-11-05', NULL),
    (6, 2, 8, '2023-02-01', NULL),
    (7, 3, 9, '2021-04-12', NULL),
    (8, 3, 10, '2016-09-01', NULL),
    (9, 4, 11, '2024-01-15', NULL),
    (10, 4, 12, '2020-07-01', NULL);

-- ---------------------------------------------------------------------
-- communities_administrators (end_date NULL = administrador actual)
-- ---------------------------------------------------------------------
INSERT INTO communities_administrators
    (community_administrator_id, community_id, user_id, start_date, end_date) VALUES
    (1, 1, 3, '2015-01-01', '2019-12-31'),
    (2, 1, 2, '2020-01-01', NULL),
    (3, 2, 2, '2021-06-01', NULL),
    (4, 3, 2, '2022-01-01', NULL),
    (5, 4, 3, '2020-07-01', NULL),
    (6, 5, 3, '2012-01-01', '2022-12-31');

-- ---------------------------------------------------------------------
-- communities_presidents (end_date NULL = presidente actual)
-- ---------------------------------------------------------------------
INSERT INTO communities_presidents
    (community_president_id, community_id, user_id, start_date, end_date) VALUES
    (1, 1, 6, '2019-01-01', '2022-12-31'),
    (2, 1, 4, '2023-01-01', NULL),
    (3, 2, 7, '2022-01-01', NULL),
    (4, 3, 10, '2021-05-01', NULL),
    (5, 4, 12, '2022-01-01', NULL);

-- ---------------------------------------------------------------------
-- communities_caretakers (end_date NULL = conserje actual)
-- Las comunidades 3, 4 y 5 no tienen conserje actual (la 4 tuvo uno hasta 2022).
-- ---------------------------------------------------------------------
INSERT INTO communities_caretakers
    (community_caretaker_id, community_id, user_id, start_date, end_date) VALUES
    (1, 1, 15, '2018-03-01', NULL),
    (2, 4, 16, '2019-02-01', '2022-06-30'),
    (3, 2, 16, '2022-07-01', NULL);

-- ---------------------------------------------------------------------
-- incidences
--   status:   1 Pendiente, 2 En progreso, 3 Resuelto
--   priority: 1 Baja, 2 Media, 3 Alta
-- ---------------------------------------------------------------------
INSERT INTO incidences
    (incidence_id, community_id, property_id, reported_by_user_id, name, status, priority, description, created_date, max_resolution_date) VALUES
    (1, 1, 102, 5, 'Gotera en el techo del salón', 1, 3, 'Aparece una mancha de humedad que gotea cuando llueve.', '2026-09-28 09:15:00', '2026-10-10'),
    (2, 1, NULL, 4, 'Ascensor del portal 1 averiado', 2, 3, 'El ascensor se queda parado entre la planta 1 y la 2.', '2026-09-20 18:40:00', '2026-10-05'),
    (3, 1, NULL, 6, 'Bombilla fundida en el Bloque B', 3, 1, 'Falta la luz de la escalera en la planta 3.', '2026-08-30 08:05:00', '2026-09-06'),
    (4, 1, 101, 4, 'Ruido en la tubería del baño', 1, 2, 'Se oye un golpeteo continuo al abrir el agua caliente.', '2026-10-01 20:10:00', '2026-10-20'),
    (5, 2, NULL, 7, 'La puerta del portal no cierra bien', 2, 2, 'La puerta queda entreabierta y entra cualquiera.', '2026-09-15 12:30:00', '2026-10-15'),
    (6, 2, 202, 8, 'Persiana comunitaria atascada', 3, 1, 'La persiana de la escalera no sube del todo.', '2026-07-22 10:00:00', '2026-08-05'),
    (7, 3, NULL, 9, 'Farola averiada en la calle principal', 1, 2, 'La farola de la entrada de la urbanización no enciende.', '2026-09-30 21:00:00', '2026-10-30'),
    (8, 3, 302, 10, 'Valla del jardín dañada', 2, 1, 'Faltan dos tablas de la valla que da a la calle.', '2026-09-05 11:20:00', '2026-10-12'),
    (9, 4, NULL, 11, 'Filtración de agua en el garaje', 1, 3, 'Hay un charco permanente junto a las plazas 12 y 13.', '2026-10-02 07:50:00', '2026-10-12'),
    (10, 4, 402, 12, 'Humedad en el trastero', 2, 2, 'Las paredes del trastero están húmedas y huele a moho.', '2026-09-10 16:45:00', '2026-10-01'),
    (11, 2, 201, 7, 'Interfono sin funcionar', 3, 2, 'No se oye al abrir desde el telefonillo del 4º A.', '2026-06-18 09:00:00', '2026-07-01'),
    (12, 1, NULL, 5, 'Limpieza insuficiente en las escaleras', 1, 1, 'Las escaleras llevan una semana sin limpiarse.', '2026-10-03 13:25:00', NULL);

-- ---------------------------------------------------------------------
-- incidence_comments (seguimiento de cada incidencia, con fecha)
-- Los escriben administradores, presidentes y conserjes de la comunidad; la incidencia 12 no tiene comentarios.
-- ---------------------------------------------------------------------
INSERT INTO incidence_comments
    (comment_id, incidence_id, user_id, comment, created_date) VALUES
    (1, 11, 2, 'Avisado el técnico de telecomunicaciones.', '2026-06-19 10:00:00'),
    (2, 11, 2, 'Interfono reparado. Cierro la incidencia.', '2026-06-26 11:30:00'),
    (3, 6, 2, 'Avisado el persianista.', '2026-07-23 09:30:00'),
    (4, 6, 2, 'Persiana reparada. Cierro la incidencia.', '2026-07-29 13:00:00'),
    (5, 3, 2, 'Programada la sustitución de la bombilla.', '2026-08-30 12:00:00'),
    (6, 3, 15, 'He sustituido la bombilla de la escalera. Queda resuelta.', '2026-09-02 10:30:00'),
    (7, 8, 2, 'Pedido presupuesto de carpintería para reponer las tablas.', '2026-09-06 10:00:00'),
    (8, 10, 3, 'Contactada la empresa de impermeabilización.', '2026-09-11 09:00:00'),
    (9, 5, 16, 'He revisado la puerta: se ha roto el muelle de cierre.', '2026-09-15 18:00:00'),
    (10, 5, 2, 'Solicitado presupuesto para reparar el cierre de la puerta del portal.', '2026-09-16 10:00:00'),
    (11, 8, 10, 'El carpintero repondrá las tablas la semana del 12 de octubre.', '2026-09-20 12:00:00'),
    (12, 2, 2, 'Avisada la empresa del ascensor. Mientras tanto, usad las escaleras.', '2026-09-21 09:00:00'),
    (13, 2, 4, 'Confirmado con la empresa: falta una pieza del cuadro de maniobra.', '2026-09-23 12:15:00'),
    (14, 5, 7, 'Presupuesto aprobado. Pendiente de fecha de instalación.', '2026-09-25 18:00:00'),
    (15, 1, 2, 'Recibida. He avisado a la empresa de mantenimiento para que revise la cubierta.', '2026-09-28 10:05:00'),
    (16, 10, 12, 'Han hecho la primera visita; el tratamiento está previsto para esta semana.', '2026-09-28 17:30:00'),
    (17, 2, 2, 'La pieza llega el 5 de octubre y la reparación está prevista ese mismo día.', '2026-09-29 11:00:00'),
    (18, 1, 2, 'El técnico visitará la vivienda el jueves por la mañana.', '2026-09-30 17:30:00'),
    (19, 7, 10, 'Avisada la empresa de alumbrado para que revise la farola.', '2026-10-01 08:30:00'),
    (20, 4, 2, 'Pendiente de que el fontanero confirme la fecha de visita.', '2026-10-02 09:00:00'),
    (21, 9, 3, 'Avisado el servicio de fontanería para localizar el origen de la filtración.', '2026-10-02 12:00:00');

-- ---------------------------------------------------------------------
-- incidence_pictures (fotos de cada incidencia: máximo 5; se muestran por picture_id)
-- Solo se guarda la ruta del archivo. Las incidencias sin fotos no tienen filas aquí.
--   Incidencia 1: 2 fotos | 2: 2 | 7: 1 | 9: 3 | 10: 5 (el máximo permitido)
-- ---------------------------------------------------------------------
INSERT INTO incidence_pictures
    (picture_id, incidence_id, url, created_date) VALUES
    (1, 1, 'incidences/gotera_102_techo.jpg', '2026-09-28 09:15:00'),
    (2, 1, 'incidences/gotera_102_mancha.jpg', '2026-09-28 09:15:00'),
    (3, 2, 'incidences/ascensor_portal1.jpg', '2026-09-20 18:40:00'),
    (4, 2, 'incidences/ascensor_botonera.jpg', '2026-09-20 18:40:00'),
    (5, 7, 'incidences/farola.jpg', '2026-09-30 21:00:00'),
    (6, 9, 'incidences/garaje_general.jpg', '2026-10-02 07:50:00'),
    (7, 9, 'incidences/garaje_charco.jpg', '2026-10-02 07:50:00'),
    (8, 9, 'incidences/garaje_plaza12.jpg', '2026-10-02 07:50:00'),
    (9, 10, 'incidences/trastero_1.jpg', '2026-09-10 16:45:00'),
    (10, 10, 'incidences/trastero_2.jpg', '2026-09-10 16:45:00'),
    (11, 10, 'incidences/trastero_3.jpg', '2026-09-10 16:45:00'),
    (12, 10, 'incidences/trastero_4.jpg', '2026-09-10 16:45:00'),
    (13, 10, 'incidences/trastero_5.jpg', '2026-09-10 16:45:00');

-- ---------------------------------------------------------------------
-- Ajustar los contadores para que los próximos INSERT sin id no choquen
-- ---------------------------------------------------------------------
DO $$
BEGIN
    PERFORM setval(pg_get_serial_sequence('users', 'user_id'), (SELECT MAX(user_id) FROM users));
    PERFORM setval(pg_get_serial_sequence('communities', 'community_id'), (SELECT MAX(community_id) FROM communities));
    PERFORM setval(pg_get_serial_sequence('properties', 'property_id'), (SELECT MAX(property_id) FROM properties));
    PERFORM setval(pg_get_serial_sequence('communities_users', 'community_user_id'), (SELECT MAX(community_user_id) FROM communities_users));
    PERFORM setval(pg_get_serial_sequence('communities_administrators', 'community_administrator_id'), (SELECT MAX(community_administrator_id) FROM communities_administrators));
    PERFORM setval(pg_get_serial_sequence('communities_presidents', 'community_president_id'), (SELECT MAX(community_president_id) FROM communities_presidents));
    PERFORM setval(pg_get_serial_sequence('communities_caretakers', 'community_caretaker_id'), (SELECT MAX(community_caretaker_id) FROM communities_caretakers));
    PERFORM setval(pg_get_serial_sequence('incidences', 'incidence_id'), (SELECT MAX(incidence_id) FROM incidences));
    PERFORM setval(pg_get_serial_sequence('incidence_comments', 'comment_id'), (SELECT MAX(comment_id) FROM incidence_comments));
    PERFORM setval(pg_get_serial_sequence('incidence_pictures', 'picture_id'), (SELECT MAX(picture_id) FROM incidence_pictures));
END $$;

-- ---------------------------------------------------------------------
-- Contraseña de pruebas para todos los usuarios (el login del back compara en texto plano)
-- ---------------------------------------------------------------------
UPDATE users SET password = 'Gescom@1234';

COMMIT;

-- =====================================================================
-- Consultas de ejemplo para probar los datos
-- =====================================================================

-- 1) Usuarios con su tipo, ciudad y provincia
-- SELECT u.user_id, u.name, u.lastname,
--        CASE u.type WHEN 1 THEN 'Superadmin' WHEN 2 THEN 'Administrador' WHEN 3 THEN 'Residente' END AS tipo,
--        CASE u.resident_type WHEN 1 THEN 'Propietario' WHEN 2 THEN 'Inquilino' END AS tipo_residente,
--        c.name AS ciudad, p.name AS provincia
-- FROM users u
-- LEFT JOIN cities c    ON c.city_id = u.city_id
-- LEFT JOIN provinces p ON p.province_id = c.province_id
-- ORDER BY u.user_id;

-- 2) Comunidades activas con su tipo y ciudad
-- SELECT co.community_id, co.name,
--        CASE co.type WHEN 1 THEN 'Edificio' WHEN 2 THEN 'Chalet' END AS tipo,
--        c.name AS ciudad, p.name AS provincia
-- FROM communities co
-- JOIN cities c    ON c.city_id = co.city_id
-- JOIN provinces p ON p.province_id = c.province_id
-- WHERE NOT co.is_deleted;

-- 3) Incidencias no resueltas, de más a menos prioritarias
-- SELECT i.incidence_id, co.name AS comunidad, i.name,
--        CASE i.status   WHEN 1 THEN 'Pendiente' WHEN 2 THEN 'En progreso' WHEN 3 THEN 'Resuelto' END AS estado,
--        CASE i.priority WHEN 1 THEN 'Baja' WHEN 2 THEN 'Media' WHEN 3 THEN 'Alta' END AS prioridad,
--        i.max_resolution_date
-- FROM incidences i
-- JOIN communities co ON co.community_id = i.community_id
-- WHERE i.status <> 3
-- ORDER BY i.priority DESC, i.created_date;

-- 4) Número de incidencias por comunidad y estado
-- SELECT co.name, i.status, COUNT(*) AS total
-- FROM incidences i
-- JOIN communities co ON co.community_id = i.community_id
-- GROUP BY co.name, i.status
-- ORDER BY co.name, i.status;

-- 5) Incidencias vencidas (fecha límite pasada y sin resolver)
-- SELECT incidence_id, name, max_resolution_date
-- FROM incidences
-- WHERE status <> 3 AND max_resolution_date < CURRENT_DATE;

-- 6) Administrador, presidente y conserje actuales de cada comunidad
-- SELECT co.name AS comunidad,
--        ua.name || ' ' || ua.lastname AS administrador,
--        up.name || ' ' || up.lastname AS presidente,
--        uc.name || ' ' || uc.lastname AS conserje
-- FROM communities co
-- LEFT JOIN communities_administrators ca ON ca.community_id = co.community_id AND ca.end_date IS NULL
-- LEFT JOIN users ua                      ON ua.user_id = ca.user_id
-- LEFT JOIN communities_presidents cp     ON cp.community_id = co.community_id AND cp.end_date IS NULL
-- LEFT JOIN users up                      ON up.user_id = cp.user_id
-- LEFT JOIN communities_caretakers cc     ON cc.community_id = co.community_id AND cc.end_date IS NULL
-- LEFT JOIN users uc                      ON uc.user_id = cc.user_id
-- WHERE NOT co.is_deleted
-- ORDER BY co.community_id;

-- 7) Residentes actuales de cada comunidad
-- SELECT co.name AS comunidad, u.name, u.lastname, cu.move_in_date
-- FROM communities_users cu
-- JOIN communities co ON co.community_id = cu.community_id
-- JOIN users u        ON u.user_id = cu.user_id
-- WHERE cu.move_out_date IS NULL
-- ORDER BY co.community_id, u.lastname;

-- 8) Seguimiento de una incidencia: comentarios en orden cronológico
-- SELECT cm.created_date, u.name || ' ' || u.lastname AS autor, cm.comment
-- FROM incidence_comments cm
-- JOIN users u ON u.user_id = cm.user_id
-- WHERE cm.incidence_id = 2
-- ORDER BY cm.created_date;

-- 9) Incidencias con su número de comentarios y la fecha del último
-- SELECT i.incidence_id, i.name, COUNT(cm.comment_id) AS comentarios, MAX(cm.created_date) AS ultimo_comentario
-- FROM incidences i
-- LEFT JOIN incidence_comments cm ON cm.incidence_id = i.incidence_id
-- GROUP BY i.incidence_id, i.name
-- ORDER BY i.incidence_id;

-- 10) Usuarios de una comunidad (la 1) con sus roles vigentes: base de la vista "Usuarios" del superadmin
-- WITH miembros AS (
--     SELECT user_id FROM communities_users          WHERE community_id = 1 AND move_out_date IS NULL
--     UNION SELECT user_id FROM communities_administrators WHERE community_id = 1 AND end_date IS NULL
--     UNION SELECT user_id FROM communities_presidents     WHERE community_id = 1 AND end_date IS NULL
--     UNION SELECT user_id FROM communities_caretakers     WHERE community_id = 1 AND end_date IS NULL
-- )
-- SELECT u.user_id, u.name, u.lastname,
--        CASE u.resident_type WHEN 1 THEN 'Propietario' WHEN 2 THEN 'Inquilino' END AS tipo_residente,
--        EXISTS (SELECT 1 FROM communities_administrators x WHERE x.user_id = u.user_id AND x.community_id = 1 AND x.end_date IS NULL) AS administrador,
--        EXISTS (SELECT 1 FROM communities_presidents     x WHERE x.user_id = u.user_id AND x.community_id = 1 AND x.end_date IS NULL) AS presidente,
--        EXISTS (SELECT 1 FROM communities_caretakers     x WHERE x.user_id = u.user_id AND x.community_id = 1 AND x.end_date IS NULL) AS conserje
-- FROM users u
-- JOIN miembros m ON m.user_id = u.user_id
-- ORDER BY u.lastname;

-- 11) Comunidad a la que corresponde la URL de registro (el código viaja en la URL, p. ej. /registro/<codigo>)
-- SELECT community_id, name
-- FROM communities
-- WHERE registration_code = '4c1c929e-115d-585a-b1ee-55537cafcd1c' AND NOT is_deleted;

-- 12) Fotos de una incidencia (la 9), en el orden en que se muestran (la primera subida, primero)
-- SELECT picture_id, url
-- FROM incidence_pictures
-- WHERE incidence_id = 9
-- ORDER BY picture_id;

-- 13) Incidencias con su número de fotos (0 a 5)
-- SELECT i.incidence_id, i.name, COUNT(p.picture_id) AS fotos
-- FROM incidences i
-- LEFT JOIN incidence_pictures p ON p.incidence_id = i.incidence_id
-- GROUP BY i.incidence_id, i.name
-- ORDER BY i.incidence_id;

-- 14) Control del límite: el máximo de 5 fotos por incidencia lo valida el backend (la base de datos
--     ya no lo impone). Esta consulta debe devolver 0 filas; si devuelve alguna, hay datos fuera de regla.
-- SELECT incidence_id, COUNT(*) AS fotos
-- FROM incidence_pictures
-- GROUP BY incidence_id
-- HAVING COUNT(*) > 5;
