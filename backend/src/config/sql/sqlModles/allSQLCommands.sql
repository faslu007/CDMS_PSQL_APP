-- public.roles definition

-- Drop table

-- DROP TABLE roles;

CREATE TABLE roles (
    id serial4 NOT NULL,
    "name" varchar(150) NOT NULL,
    is_default_role bool NULL,
    CONSTRAINT roles_name_key UNIQUE (name),
    CONSTRAINT roles_pkey PRIMARY KEY (id)
);

-- public.permissions definition

-- Drop table

-- DROP TABLE permissions;

CREATE TABLE permissions (
    id serial4 NOT NULL,
    "name" varchar(150) NOT NULL,
    CONSTRAINT permissions_name_key UNIQUE (name),
    CONSTRAINT permissions_pkey PRIMARY KEY (id)
);

-- public.role_permissions definition

-- Drop table

-- DROP TABLE role_permissions;

CREATE TABLE role_permissions (
    role_id int4 NOT NULL,
    permission_id int4 NOT NULL,
    CONSTRAINT role_permissions_pkey PRIMARY KEY (role_id, permission_id)
);


-- public.role_permissions foreign keys

ALTER TABLE public.role_permissions ADD CONSTRAINT role_permissions_permission_id_fkey FOREIGN KEY (permission_id) REFERENCES permissions(id);
ALTER TABLE public.role_permissions ADD CONSTRAINT role_permissions_role_id_fkey FOREIGN KEY (role_id) REFERENCES roles(id);

-- public.temp_user definition

-- Drop table

-- DROP TABLE temp_user;

CREATE TABLE temp_user (
    id serial4 NOT NULL,
    first_name varchar(150) NOT NULL,
    last_name varchar(150) NOT NULL,
    full_name varchar(300) NULL GENERATED ALWAYS AS ((((first_name::text || ' '::text) || last_name::text))) STORED,
    email varchar(150) NOT NULL,
    phone numeric(10) NULL,
    "password" varchar(256) NOT NULL,
    "role" int4 NOT NULL,
    organisation varchar(256) NOT NULL,
    team varchar(256) NOT NULL,
    designation varchar(150) NOT NULL,
    otp varchar(10) NULL,
    is_verified bool NULL,
    CONSTRAINT temp_user_pkey PRIMARY KEY (id)
);

-- public."user" definition

-- Drop table

-- DROP TABLE "user";

CREATE TABLE "user" (
    id serial4 NOT NULL,
    first_name varchar(150) NOT NULL,
    last_name varchar(150) NOT NULL,
    full_name varchar(300) NULL GENERATED ALWAYS AS ((((first_name::text || ' '::text) || last_name::text))) STORED,
    email varchar(150) NOT NULL,
    phone numeric(10) NULL, -- need to be discuss about this field
    "password" varchar(256) NOT NULL,
    organisation varchar(256) NOT NULL,
    team varchar(256) NOT NULL,
    designation varchar(150) NOT NULL,
    is_verified bool NULL,
    is_active bool NULL DEFAULT true,
    role_id int4 NOT NULL,
    CONSTRAINT user_email_unique UNIQUE (email),
    CONSTRAINT user_pkey PRIMARY KEY (id)
);


-- public."user" foreign keys

ALTER TABLE public."user" ADD CONSTRAINT user_role_fkey FOREIGN KEY (role_id) REFERENCES roles(id);

-- public.project definition

-- Drop table

-- DROP TABLE project;

CREATE TABLE project (
    id serial4 NOT NULL,
    project_name varchar(256) NOT NULL,
    project_code varchar(256) NOT NULL,
    created_by int4 NULL,
    is_on_trial bool NULL,
    is_active bool NULL,
    is_paid bool NULL,
    payment_due_date date NULL,
    in_active_reason varchar(255) NULL,
    paymen_ref bool NULL,
    CONSTRAINT project_pkey PRIMARY KEY (id),
    CONSTRAINT project_un UNIQUE (project_code)
);


-- public.project foreign keys

ALTER TABLE public.project ADD CONSTRAINT project_created_by_fkey FOREIGN KEY (created_by) REFERENCES "user"(id);

-- public.account definition

-- Drop table

-- DROP TABLE account;

CREATE TABLE account (
    id serial4 NOT NULL,
    account_name varchar(150) NOT NULL,
    "account_type" public."account_type" NULL,
    is_account_active bool NULL DEFAULT true,
    hide_tables jsonb NULL,
    created_by int4 NULL,
    updated_by int4 NULL,
    providers _int4 NULL,
    secretkey varchar(128) NOT NULL,
    project_id int4 NULL,
    associate_with_providers bool NOT NULL DEFAULT true,
    hide_oon bool NOT NULL DEFAULT false,
    hide_portal_logins bool NOT NULL DEFAULT false,
    hide_issues bool NOT NULL DEFAULT false,
    CONSTRAINT account_pkey PRIMARY KEY (id)
);


-- public.account foreign keys

ALTER TABLE public.account ADD CONSTRAINT account_created_by_fkey FOREIGN KEY (created_by) REFERENCES "user"(id);
ALTER TABLE public.account ADD CONSTRAINT account_project_id_fkey FOREIGN KEY (project_id) REFERENCES project(id);
ALTER TABLE public.account ADD CONSTRAINT account_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES "user"(id);

-- public.accountusersession definition

-- Drop table

-- DROP TABLE accountusersession;
/*
CREATE TABLE accountusersession (
    account_id int4 NOT NULL,
    user_id int4 NOT NULL,
    CONSTRAINT accountusersession_pkey PRIMARY KEY (account_id, user_id)
);


-- public.accountusersession foreign keys

ALTER TABLE public.accountusersession ADD CONSTRAINT accountusersession_account_id_fkey FOREIGN KEY (account_id) REFERENCES account(id);
ALTER TABLE public.accountusersession ADD CONSTRAINT accountusersession_user_id_fkey FOREIGN KEY (user_id) REFERENCES "user"(id);
*/

-- public.user_activities definition

-- Drop table

-- DROP TABLE user_activities;

CREATE TABLE user_activities (
	id serial4 NOT NULL,
	note varchar(1028) NULL,
	action_type varchar(256) NULL,
	"date" date NULL,
	user_id int4 NULL,
	account_id int4 NULL,
	provider_id int4 NULL,
	project_id int4 NULL,
	CONSTRAINT user_activities_pkey PRIMARY KEY (id)
);


-- public.user_activities foreign keys

ALTER TABLE public.user_activities ADD CONSTRAINT user_activities_account_id_fkey FOREIGN KEY (account_id) REFERENCES account(id);
ALTER TABLE public.user_activities ADD CONSTRAINT user_activities_project_id_fkey FOREIGN KEY (project_id) REFERENCES project(id);
ALTER TABLE public.user_activities ADD CONSTRAINT user_activities_provider_id_fkey FOREIGN KEY (provider_id) REFERENCES account(id);
ALTER TABLE public.user_activities ADD CONSTRAINT user_activities_user_id_fkey FOREIGN KEY (user_id) REFERENCES "user"(id);

-- public.provider definition

-- Drop table

-- DROP TABLE provider;

CREATE TABLE provider (
	id int4 NOT NULL DEFAULT nextval('provider_providerid_seq'::regclass),
	providername varchar(150) NOT NULL,
	isprovideractive bool NULL DEFAULT true,
	hidetables jsonb NULL,
	accountid int4 NULL,
	provider_created_by int4 NULL,
	provider_updated_by int4 NULL,
	CONSTRAINT provider_pkey PRIMARY KEY (id)
);


-- public.provider foreign keys

ALTER TABLE public.provider ADD CONSTRAINT provider_accountid_fkey FOREIGN KEY (accountid) REFERENCES account(id) ON DELETE CASCADE;
ALTER TABLE public.provider ADD CONSTRAINT provider_updated_by_fkey FOREIGN KEY (provider_updated_by) REFERENCES "user"(id);
ALTER TABLE public.provider ADD CONSTRAINT providercreated_by_fkey FOREIGN KEY (provider_created_by) REFERENCES "user"(id);


-- public.payer definition

-- Drop table

-- DROP TABLE payer;

CREATE TABLE payer (
	id serial4 NOT NULL,
	payer_name varchar(150) NOT NULL,
	epayerid varchar(50) NULL,
	payer_state varchar(50) NULL,
	phone numeric(10) NULL,
	"payer_type" varchar(50) NOT NULL,
	payer_address jsonb NULL,
	is_edi_required bool NULL,
	is_enrollment_required bool NULL,
	CONSTRAINT payer_payer_name_key UNIQUE (payer_name),
	CONSTRAINT payer_payer_type_check CHECK (((payer_type)::text = ANY (ARRAY[('Medicare'::character varying)::text, ('Medicaid'::character varying)::text, ('Commercial'::character varying)::text, ('MCO'::character varying)::text]))),
	CONSTRAINT payer_pkey PRIMARY KEY (id)
);

/* provider session is in  redis ? */

-- public.in_network definition

-- Drop table

-- DROP TABLE in_network;

CREATE TABLE in_network (
	id int4 NOT NULL DEFAULT nextval('inn_network_id_seq'::regclass),
	payer int4 NOT NULL,
	status varchar(256) NOT NULL,
	assigned_user int4 NOT NULL,
	account_id int4 NOT NULL,
	provider_id int4 NOT NULL,
	tracking_id varchar(256) NULL,
	due_date timestamp NULL,
	active bool NOT NULL DEFAULT true,
	description varchar(256) NULL,
	document_upload_ids _int4 NULL,
	created_at timestamp NOT NULL DEFAULT now(),
	updated_at timestamp NOT NULL DEFAULT now(),
	created_by int4 NOT NULL,
	updated_by int4 NOT NULL,
	CONSTRAINT inn_network_pkey PRIMARY KEY (id)
);


-- public.in_network foreign keys

ALTER TABLE public.in_network ADD CONSTRAINT inn_network_account_id_fkey FOREIGN KEY (account_id) REFERENCES account(id);
ALTER TABLE public.in_network ADD CONSTRAINT inn_network_assigned_user_fkey FOREIGN KEY (assigned_user) REFERENCES "user"(id);
ALTER TABLE public.in_network ADD CONSTRAINT inn_network_created_by_fkey FOREIGN KEY (created_by) REFERENCES "user"(id);
ALTER TABLE public.in_network ADD CONSTRAINT inn_network_payer_fkey FOREIGN KEY (payer) REFERENCES payer(id);
ALTER TABLE public.in_network ADD CONSTRAINT inn_network_provider_id_fkey FOREIGN KEY (provider_id) REFERENCES provider(id);
ALTER TABLE public.in_network ADD CONSTRAINT inn_network_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES "user"(id);

-- public.in_network_user_sorting definition

-- Drop table

-- DROP TABLE in_network_user_sorting;

CREATE TABLE in_network_user_sorting (
	id serial4 NOT NULL,
	userid int4 NOT NULL,
	column1 jsonb NULL,
	CONSTRAINT in_network_user_sorting_pk PRIMARY KEY (id)
);


-- public.in_network_user_sorting foreign keys

ALTER TABLE public.in_network_user_sorting ADD CONSTRAINT in_network_user_sorting_fk FOREIGN KEY (userid) REFERENCES "user"(id) ON DELETE CASCADE;

-- public.in_network_notes definition

-- Drop table

-- DROP TABLE in_network_notes;

CREATE TABLE in_network_notes (
	id serial4 NOT NULL,
	in_network_id int4 NOT NULL,
	commentername varchar(150) NOT NULL,
	commenteduserid int4 NOT NULL,
	noteorcomment varchar(2000) NOT NULL,
	created_at timestamp NOT NULL DEFAULT now(),
	updated_at timestamp NOT NULL DEFAULT now(),
	created_by int4 NOT NULL,
	updated_by int4 NOT NULL,
	CONSTRAINT in_network_notes_pkey PRIMARY KEY (id)
);


-- public.in_network_notes foreign keys

ALTER TABLE public.in_network_notes ADD CONSTRAINT in_network_notes_commenteduserid_fkey FOREIGN KEY (commenteduserid) REFERENCES "user"(id);
ALTER TABLE public.in_network_notes ADD CONSTRAINT in_network_notes_created_by_fkey FOREIGN KEY (created_by) REFERENCES "user"(id);
ALTER TABLE public.in_network_notes ADD CONSTRAINT in_network_notes_in_network_id_fkey FOREIGN KEY (in_network_id) REFERENCES in_network(id);
ALTER TABLE public.in_network_notes ADD CONSTRAINT in_network_notes_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES "user"(id);

-- public.out_of_network definition

-- Drop table

-- DROP TABLE out_of_network;

CREATE TABLE out_of_network (
	id serial4 NOT NULL,
	payer int4 NOT NULL,
	status varchar(256) NOT NULL,
	assigned_user int4 NOT NULL,
	account_id int4 NOT NULL,
	provider_id int4 NOT NULL,
	tracking_id varchar(256) NULL,
	due_date timestamp NULL,
	active bool NOT NULL DEFAULT true,
	description varchar(256) NULL,
	document_upload_ids _int4 NULL,
	created_at timestamp NOT NULL DEFAULT now(),
	updated_at timestamp NOT NULL DEFAULT now(),
	created_by int4 NOT NULL,
	updated_by int4 NOT NULL,
	CONSTRAINT out_of_network_pkey PRIMARY KEY (id)
);


-- public.out_of_network foreign keys

ALTER TABLE public.out_of_network ADD CONSTRAINT out_of_network_account_id_fkey FOREIGN KEY (account_id) REFERENCES account(id);
ALTER TABLE public.out_of_network ADD CONSTRAINT out_of_network_assigned_user_fkey FOREIGN KEY (assigned_user) REFERENCES "user"(id);
ALTER TABLE public.out_of_network ADD CONSTRAINT out_of_network_created_by_fkey FOREIGN KEY (created_by) REFERENCES "user"(id);
ALTER TABLE public.out_of_network ADD CONSTRAINT out_of_network_payer_fkey FOREIGN KEY (payer) REFERENCES payer(id);
ALTER TABLE public.out_of_network ADD CONSTRAINT out_of_network_provider_id_fkey FOREIGN KEY (provider_id) REFERENCES provider(id);
ALTER TABLE public.out_of_network ADD CONSTRAINT out_of_network_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES "user"(id);

-- public.out_of_network_user_sorting definition

-- Drop table

-- DROP TABLE out_of_network_user_sorting;

CREATE TABLE out_of_network_user_sorting (
	id serial4 NOT NULL,
	userid int4 NOT NULL,
	column1 jsonb NULL,
	CONSTRAINT out_of_network_user_sorting_pk PRIMARY KEY (id)
);


-- public.out_of_network_user_sorting foreign keys

ALTER TABLE public.out_of_network_user_sorting ADD CONSTRAINT out_of_network_user_sorting_fk FOREIGN KEY (userid) REFERENCES "user"(id) ON DELETE CASCADE;

-- public.out_of_network_notes definition

-- Drop table

-- DROP TABLE out_of_network_notes;

CREATE TABLE out_of_network_notes (
	id serial4 NOT NULL,
	out_of_network_id int4 NOT NULL,
	commentername varchar(150) NOT NULL,
	commenteduserid int4 NOT NULL,
	noteorcomment varchar(2000) NOT NULL,
	created_at timestamp NOT NULL DEFAULT now(),
	updated_at timestamp NOT NULL DEFAULT now(),
	created_by int4 NOT NULL,
	updated_by int4 NOT NULL,
	CONSTRAINT out_of_network_notes_pkey PRIMARY KEY (id)
);


-- public.out_of_network_notes foreign keys

ALTER TABLE public.out_of_network_notes ADD CONSTRAINT out_of_network_notes_commenteduserid_fkey FOREIGN KEY (commenteduserid) REFERENCES "user"(id);
ALTER TABLE public.out_of_network_notes ADD CONSTRAINT out_of_network_notes_created_by_fkey FOREIGN KEY (created_by) REFERENCES "user"(id);
ALTER TABLE public.out_of_network_notes ADD CONSTRAINT out_of_network_notes_out_of_network_id_fkey FOREIGN KEY (out_of_network_id) REFERENCES out_of_network(id);
ALTER TABLE public.out_of_network_notes ADD CONSTRAINT out_of_network_notes_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES "user"(id);

-- public."location" definition

-- Drop table

-- DROP TABLE "location";

CREATE TABLE "location" (
	id serial4 NOT NULL,
	locationname varchar(150) NOT NULL,
	locationtype varchar(50) NOT NULL,
	addressline1 varchar(150) NOT NULL,
	addressline2 varchar(150) NULL,
	city varchar(150) NOT NULL,
	state varchar(150) NOT NULL,
	countyorparish varchar(30) NOT NULL,
	zip int4 NOT NULL,
	CONSTRAINT location_pkey PRIMARY KEY (id)
);

-- public.providerpif definition

-- Drop table

-- DROP TABLE providerpif;

CREATE TABLE providerpif (
	id serial4 NOT NULL,
	provider_id int4 NOT NULL,
	provider_first_name varchar(150) NOT NULL,
	provider_middle_name varchar(150) NOT NULL,
	provider_last_name varchar(150) NOT NULL,
	provider_npi varchar(30) NULL,
	provider_ssn varchar(30) NULL,
	taxonomy varchar(50) NULL,
	specialty varchar(256) NULL,
	caqh_number varchar(30) NULL,
	provider_role varchar(150) NULL,
	provider_title varchar(150) NULL,
	provider_contact_number varchar(10) NULL,
	provider_contact_email varchar(150) NULL,
	hospital_affiliations _varchar NULL,
	created_at timestamp NOT NULL DEFAULT now(),
	updated_at timestamp NOT NULL DEFAULT now(),
	location_id int4 NOT NULL,
	CONSTRAINT providerpif_pkey PRIMARY KEY (id),
	CONSTRAINT providerpif_provider_role_check CHECK (((provider_role)::text = ANY (ARRAY[('PCP'::character varying)::text, ('Specialist'::character varying)::text, ('Ordering/Prescribing'::character varying)::text])))
);

-- public.providerpif foreign keys

ALTER TABLE public.providerpif ADD CONSTRAINT providerpif_provider_id_fkey FOREIGN KEY (provider_id) REFERENCES provider(id);
ALTER TABLE public.providerpif ADD CONSTRAINT providerpif_location_fkey FOREIGN KEY (location_id) REFERENCES "location"(id);

-- public.accountpif definition

-- Drop table

-- DROP TABLE accountpif;

CREATE TABLE accountpif (
	id serial4 NOT NULL,
	account_id int4 NOT NULL,
	businessname varchar(150) NOT NULL,
	dba varchar(150) NOT NULL,
	taxid varchar(30) NOT NULL,
	taxclassification varchar(256) NOT NULL,
	type2npi varchar(30) NOT NULL,
	taxonomy varchar(50) NOT NULL,
	businessstartdate date NOT NULL,
	specialty varchar(256) NULL,
	npienumerationdate date NULL,
	phone numeric(10) NULL,
	fax numeric(10) NULL,
	officecontact varchar(150) NULL,
	location_id int4 NOT NULL,
	CONSTRAINT accountpif_pkey PRIMARY KEY (id)
);


-- public.accountpif foreign keys

ALTER TABLE public.accountpif ADD CONSTRAINT accountpif_location_fkey FOREIGN KEY (location_id) REFERENCES "location"(id);
ALTER TABLE public.accountpif ADD CONSTRAINT accountpif_account_fkey FOREIGN KEY (account_id) REFERENCES "account"(id);

-- public.bank_info definition

-- Drop table

-- DROP TABLE bank_info;

CREATE TABLE bank_info (
	id serial4 NOT NULL,
	account_pif_id int4 NOT NULL,
	bank_name varchar(150) NOT NULL,
	"account_type" varchar NOT NULL,
	account_number numeric NULL,
	routing_number numeric NULL,
	bank_contact_name varchar(150) NULL,
	bank_address varchar(256) NOT NULL
);


-- public.bank_info foreign keys

ALTER TABLE public.bank_info ADD CONSTRAINT bank_info_account_pif_fkey FOREIGN KEY (account_pif_id) REFERENCES "accountpif"(id);

-- public.licenses definition

-- Drop table

-- DROP TABLE licenses;

CREATE TABLE licenses (
	id serial4 NOT NULL,
	account_pif_id int4 NOT NULL,
	license_type varchar(30) NOT NULL,
	license_number_or_id varchar(30) NOT NULL,
	license_effective date NOT NULL,
	license_expiry date NULL
);


-- public.licenses foreign keys
ALTER TABLE public.licenses ADD CONSTRAINT licenses_account_pif_fkey FOREIGN KEY (account_pif_id) REFERENCES "accountpif"(id);

-- public.medical_director definition

-- Drop table

-- DROP TABLE medical_director;

CREATE TABLE medical_director (
	id serial4 NOT NULL,
	account_pif_id int4 NOT NULL,
	director_first_name varchar(150) NOT NULL,
	director_last_name varchar(150) NOT NULL,
	director_ssn varchar(30) NOT NULL
);


-- public.medical_director foreign keys
ALTER TABLE public.medical_director ADD CONSTRAINT medical_director_account_pif_fkey FOREIGN KEY (account_pif_id) REFERENCES "accountpif"(id);

-- public.owners_and_managing_employees definition

-- Drop table

-- DROP TABLE owners_and_managing_employees;

CREATE TABLE owners_and_managing_employees (
	id int4 NOT NULL DEFAULT nextval('ownersandmanagingemployees_id_seq'::regclass),
	account_pif_id int4 NOT NULL,
	first_name varchar(150) NOT NULL,
	middle_name varchar(150) NULL,
	last_name varchar(150) NOT NULL,
	ownership_type varchar(30) NOT NULL,
	ownership_percentage numeric NOT NULL,
	"role" varchar(150) NULL,
	ssn varchar(30) NULL,
	birth_place_and_city varchar(256) NULL,
	home_address varchar(256) NULL,
	contact_number numeric NULL,
	contact_email varchar(150) NULL
);


-- public.owners_and_managing_employees foreign keys
ALTER TABLE public.owners_and_managing_employees ADD CONSTRAINT owners_and_managing_employees_account_pif_fkey FOREIGN KEY (account_pif_id) REFERENCES "accountpif"(id);

-- public.issues definition

-- Drop table

-- DROP TABLE issues;

CREATE TABLE issues (
	id serial4 NOT NULL,
	"name" varchar(256) NOT NULL,
	status varchar(256) NOT NULL,
	assigned_user_id int4 NOT NULL,
	account_id int4 NOT NULL,
	provider_id int4 NOT NULL,
	payer int4 NULL,
	tracking_id varchar(256) NULL,
	due_date timestamp NULL,
	active bool NOT NULL DEFAULT true,
	description varchar(256) NULL,
	document_upload_ids _int4 NULL,
	created_at timestamp NOT NULL DEFAULT now(),
	updated_at timestamp NOT NULL DEFAULT now(),
	created_by int4 NOT NULL,
	updated_by int4 NOT NULL,
	manual_sort_index int4 NULL ------------------
);


-- public.issues foreign keys
ALTER TABLE public.issues ADD CONSTRAINT issues_assigned_user_fkey FOREIGN KEY (assigned_user_id) REFERENCES "user"(id);
ALTER TABLE public.issues ADD CONSTRAINT issues_created_by_fkey FOREIGN KEY (created_by) REFERENCES "user"(id);
ALTER TABLE public.issues ADD CONSTRAINT issues_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES "user"(id);
ALTER TABLE public.issues ADD CONSTRAINT issues_provider_fkey FOREIGN KEY (provider_id) REFERENCES "provider"(id);
ALTER TABLE public.issues ADD CONSTRAINT issues_account_fkey FOREIGN KEY (account_id) REFERENCES "account"(id);

-- public.issues_notes definition

-- Drop table

-- DROP TABLE issues_notes;

CREATE TABLE issues_notes (
	id serial4 NOT NULL,
	issues_id int4 NOT NULL,
	commenter_name varchar(150) NOT NULL,
	commented_user_id int4 NOT NULL,
	note_or_comment varchar(2000) NOT NULL,
	created_at timestamp NOT NULL DEFAULT now(),
	updated_at timestamp NOT NULL DEFAULT now(),
	created_by int4 NOT NULL,
	updated_by int4 NOT NULL
);


-- public.issues_notes foreign keys
ALTER TABLE public.issues_notes ADD CONSTRAINT issues_notes_issues_fkey FOREIGN KEY (issues_id) REFERENCES "issues"(id);
ALTER TABLE public.issues_notes ADD CONSTRAINT issues_notes_commented_user_fkey FOREIGN KEY (commented_user_id) REFERENCES "user"(id);
ALTER TABLE public.issues_notes ADD CONSTRAINT issues_notes_created_by_fkey FOREIGN KEY (created_by) REFERENCES "user"(id);
ALTER TABLE public.issues_notes ADD CONSTRAINT issues_notes_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES "user"(id);

-- public.portallogins definition

-- Drop table

-- DROP TABLE portallogins;

CREATE TABLE portal_logins (
	id serial4 NOT NULL,
	portal_name varchar(150) NOT NULL,
	user_name varchar(150) NOT NULL,
	registered_email varchar(150) NOT NULL,
	"password" varchar(150) NOT NULL,
	link varchar(1000) NULL,
	security_questions jsonb NULL,
	account_id int4 NOT NULL,
	provider_id int4 NOT NULL,
	payer_id int4 NULL,
	active bool NOT NULL DEFAULT true,
	document_upload_id int4 NULL,
	created_at timestamp NOT NULL DEFAULT now(),
	updated_at timestamp NOT NULL DEFAULT now(),
	created_by int4 NOT NULL,
	updated_by int4 NOT NULL
);


-- public.portallogins foreign keys
ALTER TABLE public.portal_logins ADD CONSTRAINT portal_logins_account_fkey FOREIGN KEY (account_id) REFERENCES "account"(id);
ALTER TABLE public.portal_logins ADD CONSTRAINT portal_logins_payer_fkey FOREIGN KEY (payer_id) REFERENCES "payer"(id);
ALTER TABLE public.portal_logins ADD CONSTRAINT portal_logins_provider_fkey FOREIGN KEY (provider_id) REFERENCES "provider"(id);
ALTER TABLE public.portal_logins ADD CONSTRAINT portal_logins_created_by_fkey FOREIGN KEY (created_by) REFERENCES "user"(id);
ALTER TABLE public.portal_logins ADD CONSTRAINT portal_logins_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES "user"(id);

