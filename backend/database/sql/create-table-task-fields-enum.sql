create table if not exists task_fields_enum (
    task_fields_enum_id serial primary key,
    task_fields_enum varchar unique
);