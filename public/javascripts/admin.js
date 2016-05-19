function getFormData() {
  var programme = {
    elements: {},
    values: {}
  };
  programme.elements.fbId = document.getElementById('inputFbId');
  programme.elements.fbName = document.getElementById('inputFbName');
  programme.elements.bbcPid = document.getElementById('inputBbcPid');

  programme.values.fbId = document.getElementById('inputFbId').value;
  programme.values.fbName = document.getElementById('inputFbName').value;
  programme.values.bbcPid = document.getElementById('inputBbcPid').value;

  if (validateInput(programme)) {
    $.ajax({
      url: '/programme',
      type: 'put',
      data: programme.values
    }, function(err, response) {

    });
  }
}

function validateInput(programme) {
  var formValid = true;
  for (var key in programme.values) {
    if (programme.values.hasOwnProperty(key)) {
      if (programme.values[key]) { //do more validation here
        console.log('valid');
      } else {
        console.log('invalid');
        //TODO: set proper error message
        programme.elements[key].value = 'INVALID'
        formValid = false;
      }
    }
  }
  return formValid;
}

(function() {
  document.getElementById('btnAddProgramme').addEventListener('click', function(event) {
    event.preventDefault();
    getFormData();
  });
})();
