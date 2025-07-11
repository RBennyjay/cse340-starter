NSGjYJw989G0cISlQUemot1U9wLJ7XcF -- This SQL query retrieves the names of all employees who have a salary greater than 50000
-- and who work in the 'Sales' department.
SELECT name
FROM employees
WHERE salary > 50000
    AND department = 'Sales';