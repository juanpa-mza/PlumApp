-- =====================================================
-- PLUM APP DE LA LIGA - Schema SQL para Supabase
-- Ejecutar en el SQL Editor de Supabase
-- =====================================================

-- Tabla de eventos
CREATE TABLE IF NOT EXISTS eventos (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre      TEXT NOT NULL,
  fecha       DATE DEFAULT CURRENT_DATE,
  activa      BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de votos
CREATE TABLE IF NOT EXISTS votos (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  evento_id   UUID NOT NULL REFERENCES eventos(id) ON DELETE CASCADE,
  elenco      TEXT NOT NULL CHECK (elenco IN ('elenco_a', 'elenco_b', 'elenco_c', 'elenco_d')),
  fecha       TIMESTAMPTZ DEFAULT NOW(),
  device_id   TEXT NOT NULL
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_votos_evento_id ON votos(evento_id);
CREATE INDEX IF NOT EXISTS idx_votos_device_evento ON votos(device_id, evento_id);
CREATE INDEX IF NOT EXISTS idx_eventos_activa ON eventos(activa);

-- Constraint: 1 voto por device por evento
ALTER TABLE votos
  ADD CONSTRAINT uq_voto_device_evento
  UNIQUE (device_id, evento_id);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE eventos ENABLE ROW LEVEL SECURITY;
ALTER TABLE votos ENABLE ROW LEVEL SECURITY;

-- Política: cualquiera puede leer eventos activos
CREATE POLICY "Lectura pública de eventos"
  ON eventos FOR SELECT
  USING (true);

-- Política: solo el service role puede insertar/actualizar eventos
CREATE POLICY "Admin puede gestionar eventos"
  ON eventos FOR ALL
  USING (auth.role() = 'service_role');

-- Política: cualquiera puede insertar un voto (anon)
CREATE POLICY "Insertar voto público"
  ON votos FOR INSERT
  WITH CHECK (true);

-- Política: cualquiera puede leer votos (para el admin en el cliente)
CREATE POLICY "Lectura pública de votos"
  ON votos FOR SELECT
  USING (true);

-- Política: solo service role puede borrar votos
CREATE POLICY "Admin puede borrar votos"
  ON votos FOR DELETE
  USING (auth.role() = 'service_role');

-- =====================================================
-- Insertar un evento de prueba
-- =====================================================
INSERT INTO eventos (nombre, activa)
VALUES ('Evento Inaugural - Liga Mendocina', TRUE);

-- =====================================================
-- Vista auxiliar: resultados por evento
-- =====================================================
CREATE OR REPLACE VIEW resultados_por_evento AS
SELECT
  e.id AS evento_id,
  e.nombre AS evento,
  v.elenco,
  COUNT(*) AS total_votos,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (PARTITION BY e.id), 1) AS porcentaje
FROM votos v
JOIN eventos e ON e.id = v.evento_id
GROUP BY e.id, e.nombre, v.elenco
ORDER BY e.id, total_votos DESC;
