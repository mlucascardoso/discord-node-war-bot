-- public.nodewar_types definição

-- Drop table

-- DROP TABLE public.nodewar_types;

CREATE TABLE public.nodewar_types (
	id serial4 NOT NULL,
	"name" varchar(50) NOT NULL,
	display_name varchar(100) NOT NULL,
	total_slots int4 NOT NULL,
	tier int4 NOT NULL,
	is_default bool DEFAULT false NULL,
	created_at timestamptz DEFAULT CURRENT_TIMESTAMP NULL,
	CONSTRAINT nodewar_types_name_key UNIQUE ("name"),
	CONSTRAINT nodewar_types_pkey PRIMARY KEY (id)
);


-- public.nodewar_types chaves estrangeiras

-- public.nodewar_sessions definição

-- Drop table

-- DROP TABLE public.nodewar_sessions;

CREATE TABLE public.nodewar_sessions (
	id serial4 NOT NULL,
	nodewar_type_id int4 NOT NULL,
	battle_date date NOT NULL,
	discord_channel_id varchar(100) NULL,
	discord_message_id varchar(100) NULL,
	is_active bool DEFAULT true NULL,
	created_by varchar(100) NULL,
	created_at timestamptz DEFAULT CURRENT_TIMESTAMP NULL,
	closed_at timestamptz NULL,
	CONSTRAINT nodewar_sessions_pkey PRIMARY KEY (id)
);


-- public.nodewar_sessions chaves estrangeiras

-- public.nodewar_participants definição

-- Drop table

-- DROP TABLE public.nodewar_participants;

CREATE TABLE public.nodewar_participants (
	id serial4 NOT NULL,
	session_id int4 NOT NULL,
	member_id int4 NULL,
	assigned_role_id int4 NOT NULL,
	is_waitlisted bool DEFAULT false NULL,
	joined_at timestamptz DEFAULT CURRENT_TIMESTAMP NULL,
	CONSTRAINT nodewar_participants_pkey PRIMARY KEY (id)
);
CREATE INDEX idx_nodewar_participants_session ON public.nodewar_participants (session_id);


-- public.nodewar_participants chaves estrangeiras

ALTER TABLE public.nodewar_participants ADD CONSTRAINT nodewar_participants_assigned_role_id_fkey FOREIGN KEY (assigned_role_id) REFERENCES public.roles(id);
ALTER TABLE public.nodewar_participants ADD CONSTRAINT nodewar_participants_member_id_fkey FOREIGN KEY (member_id) REFERENCES public.members(id) ON DELETE SET NULL;
ALTER TABLE public.nodewar_participants ADD CONSTRAINT nodewar_participants_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.nodewar_sessions(id) ON DELETE CASCADE;

-- public.nodewar_config definição

-- Drop table

-- DROP TABLE public.nodewar_config;

CREATE TABLE public.nodewar_config (
	id serial4 NOT NULL,
	nodewar_type_id int4 NOT NULL,
	role_id int4 NOT NULL,
	max_participants int4 DEFAULT 0 NOT NULL,
	priority_order int4 DEFAULT 1 NOT NULL,
	created_at timestamptz DEFAULT CURRENT_TIMESTAMP NULL
);


-- public.nodewar_config chaves estrangeiras