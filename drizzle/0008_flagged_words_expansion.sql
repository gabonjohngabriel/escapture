INSERT INTO "flagged_words" ("word") VALUES
  ('fuck'),
  ('shit'),
  ('kill'),
  ('tangina'),
  ('tang ina'),
  ('putang ina mo'),
  ('putangina mo'),
  ('potang na mo'),
  ('kantutin kita'),
  ('kantotin kita'),
  ('kantutin kta'),
  ('kantotin kta'),
  ('jabol')
ON CONFLICT ("word") DO NOTHING;
