create table if not exists status_enum (
    status_enum_id serial primary key,
    status_enum varchar unique
);