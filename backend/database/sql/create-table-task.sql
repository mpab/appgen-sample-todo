create table if not exists task (
    task_id serial primary key,
    task varchar,
    assignee_enum_id integer references assignee_enum(assignee_enum_id),
    due_date varchar,
    status_enum_id integer references status_enum(status_enum_id)
);