DROP TABLE IF EXISTS users;
CREATE TABLE IF NOT EXISTS users(
	id serial primary key,
	name varchar(80),
	created_at timestamp not null default now()
);