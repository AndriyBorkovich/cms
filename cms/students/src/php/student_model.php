<?php
ini_set('display_errors', 0);
class StudentModel
{
    private int $id;
    private string $groupName;
    private string $fullName;
    private string $gender;
    private string $birthDay;
  
    public function __construct($id, $groupName, $fullName, $gender, $birthDay)
    {
      $this->id = $id;
      $this->groupName = $groupName;
      $this->fullName = $fullName;
      $this->gender = $gender;
      $this->birthDay = $birthDay;
    }
  
    public function getId()
    {
      return $this->id;
    }

    public function getGroup()
    {
      return $this->groupName;
    }

    public function getFullName() {
      return $this->fullName;
    }

    public function getGender() {
        return $this->gender;
    }

    public function getBirthDay() {
        return $this->birthDay;
    }
}