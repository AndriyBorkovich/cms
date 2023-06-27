<?php
require_once 'student_controller.php';
ini_set('display_errors', 1);
$user = 'Andrew25';
$password = '7yVGNSVf(K]Q(2v';
$db = 'studentsdb';

try {
    $connection = new mysqli('localhost', $user, $password);
    if ($connection->connect_errno) {
        $connection->close();
        throw new Exception("Failed to connect to MySQL: " . $connection->connect_error);
    } else {
        $result = $connection->query("SHOW DATABASES LIKE '$db'");
        if ($result === false || $result->num_rows === 0) {
            $connection->close();
            throw new Exception('DB does not exist');
        } else {
            $connection->select_db($db);
            $controller = new StudentController($connection);
            $json = file_get_contents('php://input');
            $data = json_decode($json);
            $controller->handleRequest($data);
        }
    }

}
catch (Exception $e) {
    $error = array('status' => false, 'errorMessage' => $e->getMessage());
    echo json_encode($error);
}
