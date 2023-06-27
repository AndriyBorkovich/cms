let t, readData;
window.addEventListener('load', async () =>
{
  // if('serviceWorker' in navigator)
  // {
  //   try 
  //   {
  //     // register a service worker
  //     const reg = await navigator.serviceWorker.register('./sw.js');
  //     console.log("SW success ", reg);
  //   }  
  //   catch (error) 
  //   {
  //     console.log("SW fail " + error);
  //   }
  //}

  // let action = JSON.stringify({ action: "load"});
  // console.log(action);
  // $.ajax({
  //   async: false,
  //   url: './students/src/php/requests_handler.php',
  //   type: 'POST',
  //   contentType: "application/json",
  //   data: action,
  //   success: function(data) {
  //     console.log(data);
  //     readData = JSON.parse(data);
  //     console.log(readData);
  //     if(!readData.status) {
  //       Swal.fire({
  //         icon: "warning",
  //         title: "Oops...",
  //         text: readData.errorMessage
  //       });
  //     } else {
  //       console.log("Students: ", readData.students);
  //       console.log("Max id: ",readData.count);
  //       $('#hidden-input').val(Number(readData.count));
  //     }
  //   },
  //   error: function(xhr, error) {
  //       Swal.fire({
  //         icon: "error",
  //         title: "Oops...",
  //         text: xhr.status + ": " + error
  //       });
  //   }
  // });

  // //render a table
  // t = $('#student-table').DataTable({
  //   paging: true,
  //   pageLength: 10,
  //   searching: false,
  //   lengthMenu: [
  //     [5, 10, 25, -1],
  //     [5, 10, 25, 'All'],
  //   ],
  //   data: readData.students,
  //   columns: [
  //     //checkbox
  //     {
  //       orderable: false,
  //       visible: true,
  //       data: null,
  //       render: () => {
  //         return '<input type="checkbox" id="myCheckbox">';
  //       }
  //     },
  //     {
  //       data: 'group',
  //       orderable: true
  //     },
  //     {
  //       data: 'fullName',
  //       orderable: true
  //     },
  //     {
  //       data: 'gender',
  //       orderable: true,
  //     },
  //     {
  //       data: 'birthday'
  //     },
  //     // status
  //     {
  //       visible: true,
  //       orderable: false,
  //       data: null,
  //       render: () => {
  //         return '<span class="dot" id = "status"></span>';
  //       }
  //     },
  //     {
  //       orderable: false,
  //       visible: true,
  //       data: null,
  //       render: () => {
  //         return `
  //               <i class="material-icons edit-btn">edit</i>
  //               <i id="delete-btn" class="material-icons" onclick="DeleteStudent(this)">delete</i>
  //             `;
  //       }
  //     }
  //   ],
  //   createdRow: (row, students) => {
  //     $(row).attr('data-id', students.id);
  //   }
  // });


});

function redirect()
{
  window.location.href = 'chat/login/login.html';
}

var rIndex, rowElements, idToEdit;
function DeleteStudent(button) {
  Swal.fire({
    title: 'Do you want to delete this student?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes',
  }).then((result) => {
    if (result.isConfirmed) {
      let row = button.parentNode.parentNode;
      console.log(row);
      let idToDelete = row.getAttribute('data-id');
      console.log("ID to delete:", idToDelete);
      $.ajax({
        type:"POST",
        url: "./src/php/requests_handler.php",
        contentType: "application/json",
        dataType: "json",
        data: JSON.stringify({ action: 'delete', id: idToDelete }),

        success: function(response) {
          console.log("Response from server:\n" + response);
            if (!response.status) {
              Swal.fire({
                icon: "warning",
                title: "Oops...",
                text: response.errorMessage
              });
              setTimeout(function() {
                location.reload();
              }, 2000);
      
            } else {
              let row = t.row(`[data-id="${idToDelete}"]`);
              row.remove().draw(false);
              Swal.fire({
                icon: "success",
                title: "Congrats",
                text: "Student deleted successfully!"
              });

              const rows = t.rows().nodes(); // Get all rows as an array

              if (rows.length > 1) { // Check that there are at least two rows in the table
                const preLastRow = rows[rows.length - 1];
                let dataId = preLastRow.getAttribute('data-id');
                $("#hidden-input").val(dataId);
                console.log("New hidden id: ",$("#hidden-input").val());
              } else {
                Swal.fire({
                  icon: "warning",
                  title: "Oops...",
                  text: "No rows to delete!"
                });
              }
            }
          },
          error: function(xhr, error) {
            Swal.fire({
              icon: "error",
              title: "Oops...",
              text: xhr.status + ": " + error
            });
          }
        });
    }
  });
}


let modifyBtn = document.querySelector("#add-edit-stud-btn");
modifyBtn.addEventListener("click", (e) => {
  let genders = document.querySelector("#gender-list");
  let groups = document.querySelector("#group-list");
  let groupName = groups.options[groups.selectedIndex].text;
  let fullName = document.querySelector("#full-name").value;
  let genderName = genders.options[genders.selectedIndex].text;
  let birthDay = document.querySelector("#birth-date").value;
 
  console.log('Validation in server-side...');
  if (modifyBtn.innerHTML === "Add") {
    $('#hidden-input').val(+$('#hidden-input').val() + 1);
    let id = $('#hidden-input').val();
    console.log("New student id: ", id);
    let action = 'add';
    const formData = { action, id, groupName, fullName, genderName, birthDay };
    const jsonData = JSON.stringify(formData);
    AddStudent(jsonData);
  } else {
    let id = idToEdit;
    let action = 'edit';
    const formData = { action, id, groupName, fullName, genderName, birthDay };
    const jsonData = JSON.stringify(formData);
    EditStudent(jsonData);
  }
  
  document.querySelector(".add-edit-form").style.display = "none";
  makeDefaultFields();
  
  return true;
});

function AddStudent(jsonData)
{
  let parsedRequest = JSON.parse(jsonData);
  $.ajax({
    type: "POST",
    url: "./src/php/requests_handler.php",
    data: jsonData,
    contentType: "application/json",
    success: function(response) {
      response = JSON.parse(response);
      console.log("Response from server (for adding):\n" + response);
        if (!response.status) {
          Swal.fire({
            icon: "warning",
            title: "Oops...",
            text: response.errorMessage
          });
  
          $("#hidden-input").val(+$("#hidden-input").val() - 1);
        } else {

          let newStudent = [
            {
              group: parsedRequest.groupName,
              fullName:  parsedRequest.fullName,
              gender: parsedRequest.genderName,
              birthday: parsedRequest.birthDay
            }
          ];

          t.rows.add(newStudent);
          const rows = t.rows().nodes();
          let newRow = rows[rows.length - 1];

          $(newRow).attr('data-id', parsedRequest.id);
          t.draw();
          Swal.fire({
            icon: "success",
            title: "Congrats",
            text: "Student added successfully!"
          });
        }
      },
      error: function(xhr, error) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: xhr.status + ": " + error
      });
    }
    });

}
function EditStudent(jsonData)
{
  console.log(jsonData);
  $.ajax({
    type: "POST",
    url: "./src/php/requests_handler.php",
    data: jsonData,
    contentType: "application/json",
    success: function(response) {
      response = JSON.parse(response);
      console.log("Response from server (for editing):\n" + response);
        if (!response.status) {
          Swal.fire({
            icon: "warning",
            title: "Oops...",
            text: response.errorMessage
          });
  
        } else {
          Swal.fire({
            icon: "success",
            title: "Congrats",
            text: "Student edited successfully!"
          });

          setTimeout(() => {
            window.location.reload(true);
        }, 1500);
        }
      },
      error: function(xhr, error) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: xhr.status + ": " + error
      });
    }
    });

}
function makeDefaultFields()
{
  document.querySelector("#full-name").value = "";
  document.querySelector("#birth-date").value = "";
  document.querySelector("#group-list").value = "3";
  document.querySelector("#gender-list").value = "1";
}

function toggleDropdown(className) {
  const menu = document.querySelector(className);
  menu.classList.add('show');
}

function hideDropdown(className) {
  const menu = document.querySelector(className);
  menu.classList.remove('show');
}

let openAddWindowBtn = document.getElementById("open-add-dialog-btn");
openAddWindowBtn.addEventListener("click", () => {
  $("#form-label").text("Add new student");
  $("#add-edit-stud-btn").text("Add");
  makeDefaultFields();
  document.querySelector(".add-edit-form").classList.add("active");
  document.querySelector(".add-edit-form").style.display = "grid";
});

  document.querySelector(".close-btn").addEventListener("click", (e) => {
  e.preventDefault();
  document.querySelector(".add-edit-form").classList.remove("active");
  document.querySelector(".add-edit-form").style.display = "none";
});

function EditStudentOpen(event) {
  idToEdit = event.currentTarget.parentElement.parentElement.getAttribute('data-id');
  console.log(idToEdit);
  document.querySelector(".add-edit-form").classList.add("active");
  document.querySelector(".add-edit-form").style.display = "grid";
  $("#form-label").text("Edit student");

  $("#add-edit-stud-btn").text("Save changes");
  let activeBtn = event.target;
  rIndex = activeBtn.parentElement.parentElement.rowIndex;
  rowElements = activeBtn.parentElement.parentElement.children;
  let $groupOption = $('#group-list option')
  for (const option of $groupOption) {
      if(option.innerHTML === rowElements[1].innerHTML) {
          option.selected = true;
          break;
      }
  }

  $("#full-name").val(rowElements[2].innerHTML);
  let $genderOptions = $("#gender-list option");
  let genderValue = rowElements[3].innerHTML === "M" ? "1" : "2";
  for (const element of $genderOptions) {
    let option = element;
    if (option.value === genderValue) 
    {
      option.selected = true;
      break;
    }
  }

  const dateStr = rowElements[4].innerHTML;
  const [year, month, day] = dateStr.split("-").map(Number);

  const date = new Date(year, month - 1, day + 1);
  const dateString = date.toISOString().split("T")[0];

  const input = document.querySelector('input[type="date"]');
  input.value = dateString;
}

//$(document).on("click", ".edit-btn", EditStudentOpen);
