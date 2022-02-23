USE employees_db;

INSERT INTO department (name)
VALUES ("software design"),
    ("finance"),
    ("marketing"),
    ("human resources");

INSERT INTO role (title, salary, department_id)
VALUES ("software engineer", 110000, 1),
    ("project manager", 90000, 1),
    ("accountant", 70000, 2),
    ("accounting manager", 100000, 2),
    ("product marketing manager", 50000, 3),
    ("marketing lead", 120000, 3),
    ("hr manager", 95000, 4),
    ("benefits counselor", 65000, 4);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ("Jack", "Beanstalk", 1, NULL),
    ("Mary", "Lamb", 2, 1),
    ("Peter", "Pan", 3, NULL),
    ("Cinder", "Rella", 4, 1),
    ("Prince", "Valiant", 5, 3);