<?php
class Validator
{
    private array $error;
    public function __construct()
    {
        $this->error = array();
    }

    public function execute($fullName, $birthday) : bool
    {
        if (empty($fullName)) {
            $this->error = array('status' => false, 'errorMessage' => 'Field for full name is empty');
            return false;
        } elseif (!preg_match('/^[a-zA-Z ]{3,30}$/', $fullName)) {
            $this->error = array('status' => false, 'errorMessage' => 'Incorrect name');
            return false;
        } elseif (empty($birthday)) {
            $this->error = array('status' => false, 'errorMessage' => 'Field for birthday is empty');
            return false;
        } elseif (strtotime($birthday) > strtotime(date('Y-m-d'))) {
            $this->error =array('status' => false, 'errorMessage' => 'Date is after today');
            return false;
        }

        return true;
    }

    public function getError() : array
    {
        return $this->error;
    }
}