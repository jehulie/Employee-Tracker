require('dotenv').config();
const mysql = require('mysql2');
const inquirer = require('inquirer');
const consoleTable = require('console.table');
const { process_params } = require('express/lib/router');

// creates connection to sql database
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: process.env.MYSQL_PASSWORD,
    database: 'employees_db'
});

// connects to sql server and sql database
connection.connect(err => {
    if (err) throw err;
});

options();
// prompts user with list of options to choose from
function options() {
    inquirer
        .prompt({
            name: 'options',
            type: 'list',
            message: 'Welcome to our employee database! What would you like to do?',
            choices: [
                'View all departments',
                'View all roles',
                'View all employees',
                'Add a department',
                'Add a role',
                'Add an employee',
                'Update employee role',
                'EXIT'
            ]
        }).then(function (answer) {
            switch (answer.options) {
                case 'View all departments':
                    viewDepartments();
                    break;
                case 'View all roles':
                    viewRoles();
                    break;
                case 'View all employees':
                    viewEmployees();
                    break;
                case 'Add a department':
                    addDepartment();
                    break;
                case 'Add a role':
                    addRole();
                    break;
                case 'Add an employee':
                    addEmployee();
                    break;
                case 'Update employee role':
                    updateRole();
                    break;
                case 'EXIT':
                    Quit();
                    break;
                default:
                    break;
            };
        });
};

// view all departments in the database
function viewDepartments() {
    const table = 'SELECT department.id AS ID, department.name AS Department FROM department';
    connection.query(table, function (err, res) {
        if (err) throw err;
        console.table('Showing All Departments:', res);
        options();
    });
};

// view all roles in the database
function viewRoles() {
    const table = `SELECT role.id AS Role_ID, role.title AS Role, role.salary AS Salary, department.name AS Department
    FROM role
    INNER JOIN department ON role.department_id = department.id`;
    connection.query(table, function (err, res) {
        if (err) throw err;
        console.table('Showing All Roles:', res);
        options();
    });
};

// view all employees in the database
function viewEmployees() {
    const table = `SELECT employee.id AS Employee_ID, 
    employee.first_name AS First_Name, 
    employee.last_name AS Last_Name, 
    role.title AS Role, 
    department.name AS Department,
    role.salary AS Salary,
    manager_id AS Manager_ID 
FROM employee
    LEFT JOIN role ON employee.role_id = role.id
    LEFT JOIN department ON role.department_id = department.id`;
    connection.query(table, function (err, res) {
        if (err) throw err;
        console.log(res.length + ' employees found!');
        console.table('Showing All Employees:', res);
        options();
    });
};

// add a department to the database
function addDepartment() {
    inquirer
        .prompt([
            {
                name: 'newDepartment',
                type: 'input',
                message: 'Enter the name of the new department you would like to add.'
            }
        ]).then(function (answer) {
            const sql =
                `INSERT INTO department (name) VALUES (?)`;
            connection.query(sql, answer.newDepartment, function (err, res) {
                if (err) throw err;
                console.log('Added ' + answer.newDepartment + ' to departments!');

                viewDepartments();
            });
        });
};

// add a role to the database
function addRole() {
    connection.query('SELECT name, id FROM department', function (err, res) {
        if (err) throw err;

        inquirer
            .prompt([
                {
                    name: 'new_role',
                    type: 'input',
                    message: "Enter the name of the new role you would like to add."
                },
                {
                    name: 'salary',
                    type: 'input',
                    message: 'What is the salary of this role? (Enter a number)'
                },
                {
                    name: 'Department',
                    type: 'list',
                    choices: function () {
                        var deptArry = [];
                        for (let i = 0; i < res.length; i++) {
                            deptArry.push(res[i].name);
                        }
                        return deptArry;
                    },
                }
            ]).then(function (answer) {
                let department_id;
                for (let a = 0; a < res.length; a++) {
                    if (res[a].name == answer.Department) {
                        department_id = res[a].id;
                    }
                }

                connection.query(
                    'INSERT INTO role SET ?',
                    {
                        title: answer.new_role,
                        salary: answer.salary,
                        department_id: department_id
                    },
                    function (err, res) {
                        if (err) throw err;
                        console.log('Added ' + answer.new_role + ' to roles!');

                        viewRoles();
                    });
            });
    });
};

// add an employee to the database
function addEmployee() {
    connection.query('SELECT * FROM employee', function (err, data) {
        if (err) throw err;
        const managerArray = data.map(({ id, first_name, last_name }) => ({ name: first_name + " " + last_name, value: id }));


        connection.query('SELECT * FROM role', function (err, data) {
            if (err) throw err;
            const roleArray = data.map(({ title, id }) => ({ name: title, value: id }));

            inquirer
                .prompt([
                    {
                        name: 'first_name',
                        type: 'input',
                        message: "What is the employee's fist name? ",
                    },
                    {
                        name: 'last_name',
                        type: 'input',
                        message: "What is the employee's last name? "
                    },
                    {
                        name: 'manager_id',
                        type: 'list',
                        choices: managerArray,
                        message: "What is the employee's manager's ID? "
                    },
                    {
                        name: 'role',
                        type: 'list',
                        choices: roleArray,
                        message: "What is this employee's role? "
                    },
                ]).then(function (answer) {
                    connection.query(
                        'INSERT INTO employee SET ?',
                        {
                            first_name: answer.first_name,
                            last_name: answer.last_name,
                            role_id: answer.role,
                            manager_id: answer.manager_id,
                        },
                        function (err) {
                            if (err) throw err;
                            console.log('Added' + answer.first_name + ' ' + answer.last_name + ' to employees!');

                            viewEmployees();
                        });
                });
        });
    });
};

// update a role in the database
function updateRole() {
    connection.query('SELECT * FROM employee', function (err, data) {
        if (err) throw err;
        const employees = data.map(({ id, first_name, last_name }) => ({ name: first_name + " " + last_name, value: id }));
        inquirer.prompt([
            {
                type: 'list',
                name: 'name',
                message: "Which employee would you like to update?",
                choices: employees
            },
        ]).then(function (answer) {
            let employeeID = answer.name;
            connection.query('SELECT * FROM role', function (err, data) {
                if (err) throw err;
                const roleChoice = data.map(({ title, id }) => ({ name: title, value: id }));
                inquirer.prompt([
                    {
                        type: 'list',
                        name: 'role_id',
                        message: "What is the employee's new role?",
                        choices: roleChoice
                    },
                ])
                    .then(function (answer) {
                        const query = `UPDATE EMPLOYEE SET role_id=? WHERE id = ?;`;
                        connection.query(query, [
                            answer.role_id,
                            employeeID
                        ], (err, res) => {
                            if (err) throw err;
                            console.log('Updated the role of employee!');

                            viewEmployees();
                        });
                    });
            });
        });
    });
}

function Quit() {
    process.exit();
};
