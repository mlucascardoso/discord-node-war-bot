CREATE TABLE public.member_commitments (
    id serial4 NOT NULL,
    member_id int4 NOT NULL,
    committed_participations int4 NOT NULL DEFAULT 3,
    actual_participations int4 NOT NULL DEFAULT 0,
    notes text NULL,
    created_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT member_commitments_pkey PRIMARY KEY (id),
    CONSTRAINT member_commitments_member_id_fkey FOREIGN KEY (member_id) REFERENCES public.members(id) ON DELETE CASCADE,
    CONSTRAINT member_commitments_committed_participations_check CHECK (committed_participations >= 0 AND committed_participations <= 7),
    CONSTRAINT member_commitments_actual_participations_check CHECK (actual_participations >= 0)
);

CREATE INDEX idx_member_commitments_member ON public.member_commitments (member_id);
CREATE INDEX idx_member_commitments_created_at ON public.member_commitments (created_at);

CREATE TABLE public.member_participations (
    id serial4 NOT NULL,
    member_id int4 NOT NULL,
    session_id int4 NOT NULL,
    participation_status varchar(20) NOT NULL DEFAULT 'present',
    absence_reason text NULL,
    recorded_by_id int4 NOT NULL,
    recorded_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT member_participations_pkey PRIMARY KEY (id),
    CONSTRAINT member_participations_member_id_fkey FOREIGN KEY (member_id) REFERENCES public.members(id) ON DELETE CASCADE,
    CONSTRAINT member_participations_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.nodewar_sessions(id) ON DELETE CASCADE,
    CONSTRAINT member_participations_recorded_by_id_fkey FOREIGN KEY (recorded_by_id) REFERENCES public.members(id) ON DELETE RESTRICT,
    CONSTRAINT member_participations_status_check CHECK (participation_status IN ('present', 'late', 'absent')),
    CONSTRAINT member_participations_unique_member_session UNIQUE (member_id, session_id)
);

CREATE INDEX idx_member_participations_member ON public.member_participations (member_id);
CREATE INDEX idx_member_participations_session ON public.member_participations (session_id);
CREATE INDEX idx_member_participations_status ON public.member_participations (participation_status);
CREATE INDEX idx_member_participations_recorded_at ON public.member_participations (recorded_at);

CREATE TABLE public.member_warnings (
    id serial4 NOT NULL,
    member_id int4 NOT NULL,
    warning_type varchar(20) NOT NULL DEFAULT 'absence',
    severity varchar(10) NOT NULL DEFAULT 'low',
    description text NOT NULL,
    session_id int4 NULL,
    issued_by_id int4 NOT NULL,
    issued_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
    is_active bool DEFAULT true NOT NULL,
    resolved_at timestamptz NULL,
    resolved_by_id int4 NULL,
    resolution_notes text NULL,
    CONSTRAINT member_warnings_pkey PRIMARY KEY (id),
    CONSTRAINT member_warnings_member_id_fkey FOREIGN KEY (member_id) REFERENCES public.members(id) ON DELETE CASCADE,
    CONSTRAINT member_warnings_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.nodewar_sessions(id) ON DELETE SET NULL,
    CONSTRAINT member_warnings_issued_by_id_fkey FOREIGN KEY (issued_by_id) REFERENCES public.members(id) ON DELETE RESTRICT,
    CONSTRAINT member_warnings_resolved_by_id_fkey FOREIGN KEY (resolved_by_id) REFERENCES public.members(id) ON DELETE RESTRICT,
    CONSTRAINT member_warnings_type_check CHECK (warning_type IN ('absence', 'behavior', 'performance', 'other')),
    CONSTRAINT member_warnings_severity_check CHECK (severity IN ('low', 'medium', 'high')),
    CONSTRAINT member_warnings_resolution_check CHECK (
        (is_active = true AND resolved_at IS NULL AND resolved_by_id IS NULL) OR
        (is_active = false AND resolved_at IS NOT NULL AND resolved_by_id IS NOT NULL)
    )
);

CREATE INDEX idx_member_warnings_member ON public.member_warnings (member_id);
CREATE INDEX idx_member_warnings_type ON public.member_warnings (warning_type);
CREATE INDEX idx_member_warnings_severity ON public.member_warnings (severity);
CREATE INDEX idx_member_warnings_active ON public.member_warnings (is_active);
CREATE INDEX idx_member_warnings_issued_at ON public.member_warnings (issued_at);
CREATE INDEX idx_member_warnings_session ON public.member_warnings (session_id);

CREATE OR REPLACE FUNCTION update_member_commitments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_member_commitments_updated_at
    BEFORE UPDATE ON public.member_commitments
    FOR EACH ROW
    EXECUTE FUNCTION update_member_commitments_updated_at();

CREATE OR REPLACE FUNCTION update_actual_participations()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.participation_status = 'present' THEN
        UPDATE public.member_commitments 
        SET actual_participations = actual_participations + 1
        WHERE member_id = NEW.member_id;
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.participation_status != 'present' AND NEW.participation_status = 'present' THEN
            UPDATE public.member_commitments 
            SET actual_participations = actual_participations + 1
            WHERE member_id = NEW.member_id;
        ELSIF OLD.participation_status = 'present' AND NEW.participation_status != 'present' THEN
            UPDATE public.member_commitments 
            SET actual_participations = actual_participations - 1
            WHERE member_id = NEW.member_id AND actual_participations > 0;
        END IF;
    ELSIF TG_OP = 'DELETE' AND OLD.participation_status = 'present' THEN
        UPDATE public.member_commitments 
        SET actual_participations = actual_participations - 1
        WHERE member_id = OLD.member_id AND actual_participations > 0;
    END IF;
    
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_actual_participations
    AFTER INSERT OR UPDATE OR DELETE ON public.member_participations
    FOR EACH ROW
    EXECUTE FUNCTION update_actual_participations();
