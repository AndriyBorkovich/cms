<?php
ini_set('display_errors', 0);
class StudentDAO
{
    private $connection;
  
    public function __construct($connection)
    {
      $this->connection = $connection;
    }

    public function closeConnection(): void
    {
        $this->connection->close();
    }
  
    // method to retrieve data from the table from DB
    public function getAllStudents() : array
    {
        $result = $this->connection->query('SELECT * FROM students');
  
        $students = array();
        while ($row = $result->fetch_assoc()) {
            $students[] = new StudentModel(
                $row['id'],
                $row['group_name'],
                $row['full_name'],
                $row['gender'],
                $row['birth_day']
        );
      }

      return $students;
    }
  
    // method to add student to the table
    public function addStudent($id, $groupName, $fullName, $genderName, $birthDay) : bool
    {
        $query = "INSERT INTO students (id, group_name, full_name, gender, birth_day)
        VALUES ('$id','$groupName', '$fullName', '$genderName', '$birthDay')";

        return mysqli_query($this->connection, $query);
    }

    // method to delete student from the table by id
    public function deleteStudent($studentId): bool
    {
        $query = "DELETE FROM `students` WHERE `id` = '$studentId'";
        return mysqli_query($this->connection, $query);
    }

    // method to update student from table by id
    public function updateStudent($id, $groupName, $fullName, $genderName, $birthDay): bool
    {
        $query = "UPDATE students SET group_name = '$groupName', full_name = '$fullName',
        gender = '$genderName', birth_day = '$birthDay' WHERE id = '$id'";
        return mysqli_query($this->connection, $query);
    }

    // method to get max id from all students in the table
    public function getMaxId() :int
    {
        return $this->connection->query('SELECT MAX(`id`) as count FROM `students`')->fetch_assoc()['count'];
    }
  }
  