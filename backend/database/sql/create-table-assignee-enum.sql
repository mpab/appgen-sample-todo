create table if not exists assignee_enum (
    assignee_enum_id serial primary key,
    assignee_enum varchar unique
);