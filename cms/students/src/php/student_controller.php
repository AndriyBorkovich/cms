<?php
ini_set('display_errors', 0);
require_once 'student_model_dao.php';
require_once 'student_model.php';
require_once 'validator.php';

class StudentController
{
    private StudentDAO $studentDAO;

    public function __construct(mysqli $connection)
    {
        $this->studentDAO = new StudentDAO($connection);
    }

    public function __destruct()
    {
        $this->studentDAO->closeConnection();
    }

    public function handleRequest($data): void
    {
        $action = $data->action ?? '';
        $response = match ($action) {
            'load' => $this->load(),
            'add' => $this->add($data),
            'edit' => $this->edit($data),
            'delete' => $this->delete($data),
            default => json_encode(array('status' => false, 'errorMessage' => 'Invalid action')),
        };

        echo $response;
    }

    public function load(): false|string
    {
        $students = $this->studentDAO->getAllStudents();
        $studentsCount = $this->studentDAO->getMaxId();
        $studentsData = array();
        if($studentsCount === 0)
        {
            $dataToSend = array('status' => false, 'errorMessage' => 'Incorrect id!');
        }
        else
        {
            foreach ($students as $student) {
                $studentsData[] = array(
                    'id' => $student->getId(),
                    'group' => $student->getGroup(),
                    'fullName' => $student->getFullName(),
                    'gender' => $student->getGender(),
                    'birthday' => $student->getBirthDay()
                );
            }

            $dataToSend = array('status' => true, 'students' => $studentsData, 'count' => $studentsCount);
        }

        return json_encode($dataToSend);
    }

    public function add($data): false|string
    {
        $id = intval($data->id) ?? 0;
        $group = $data->groupName ?? '';
        $fullName = $data->fullName ?? '';
        $gender = $data->genderName ?? '';
        $birthday = $data->birthDay ?? '';
        if($id <= $this->studentDAO->getMaxId()) {
            $response = array('status' => false, 'errorMessage' => 'Incorrect id!');
        } else {
            $v = new Validator();
            if (!$v->execute($fullName, $birthday)) {
                $response = $v->getError();
            } else {
                $result = $this->studentDAO->addStudent($id, $group, $fullName, $gender, $birthday);
                if ($result === false) {
                    $response = array('status' => false, 'errorMessage' => 'Failed to add student to table');
                } else {
                    $response = array('status' => true);
                }
            }
        }

        return json_encode($response);
    }

    public function edit($data): false|string
    {
        $id = intval($data->id) ?? 0;
        $group = $data->groupName ?? '';
        $fullName = $data->fullName ?? '';
        $gender = $data->genderName ?? '';
        $birthday = $data->birthDay ?? '';

        if($id > $this->studentDAO->getMaxId()) {
            $response = array('status' => false, 'errorMessage' => 'No student with this ID in DB!');
        } else {
            $v = new Validator();

            if (!$v->execute($fullName, $birthday)) {
                $response = $v->getError();
            } else {
                $result = $this->studentDAO->updateStudent(
                    $id,
                    $group,
                    $fullName,
                    $gender,
                    $birthday
                );

                if ($result === false) {
                    $response = array('status' => false, 'errorMessage' => 'Failed to edit student in the table');
                } else {
                    $response = array('status' => true);
                }
            }
        }

        return json_encode($response);
    }

    public function delete($data): false|string
    {
        $id = intval($data->id) ?? 0;
        if($id > $this->studentDAO->getMaxId() || $id < 0)
        {
            $response = array('status' => false, 'errorMessage' => 'No student with this ID in DB!');
        }
        else
        {
            $result = $this->studentDAO->deleteStudent($id);
            if ($result === false) {
                $response = array('status' => false, 'errorMessage' => 'Failed to delete student from table');
            } else {
                $response = array('status' => true);
            }
        }

        return json_encode($response);
    }
}

