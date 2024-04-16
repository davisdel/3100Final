
var regexEmail = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/g
var regexPassword = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/g

$(document).ready(function(){
    if(sessionStorage.getItem("SessionID")){
        $.getJSON("https://simplecoop.swollenhippo.com/sessions.php", {SessionID:sessionStorage.getItem("SessionID")}, function(result){
            if(result != null){
                
                populateEnviromentChart();
                populateEggChart();
                fetchAndLogSettings();

                $('#divLogin').slideToggle(function(){
                    $('#divDashboard').slideToggle();
                })

                $("#sortable").sortable({
                    distance: 30
                })
            }
        })
    }

    $('#settingCoopTempInt').on('input', function() {
        $('#settingCoopTemp').val($(this).val());
    });

    $('#settingCoopTemp').on('input', function() {
        $('#settingCoopTempInt').val($(this).val());
    });
})

async function getSettings() {
    var sessionID = sessionStorage.getItem("SessionID");
    var maxNum = $('#divSettings input, #divSettings select').length;
    $('#divSettings input, #divSettings select').each(function(index) {
        var settingName = $(this).attr('id');
        if (!$(this).attr('data-ignore')) {
            $.ajax({
                type: 'GET',
                url: 'https://simplecoop.swollenhippo.com/settings.php',
                data: {
                    SessionID: sessionID,
                    setting: settingName
                },
                success: function (response) {
                    // Assuming the response is a JSON array of setting objects
                    response = JSON.parse(response)
                    if (response){
                            if ($('#' + settingName).attr('type') == 'checkbox' || $('#' + settingName).attr('type') == 'radio') {
                                if(response.Value == 'true'){                                
                                    $('#'+settingName).prop('checked', true);
                                } else {

                                }
                            } else if ($('#' + settingName).attr('type') == 'range'){
                                $('#'+settingName).val(response.Value);

                                targetId = $('#' + settingName).attr('data-target');
                                if (targetId) {
                                    $(targetId).val(response.Value);
                                } else {
                                    console.log("Could not find target box");
                                }
                            } else {
                                $('#'+settingName).val(response.Value);
                            }
                            setSetting(response.Setting, response.Value);
                    }
                },
                error: function (xhr, status, error) {
                    console.error('Error fetching settings:', error);
                    blnError = true;
                }
            })
        }

    }) // for each ends
}

// Function to fetch and log the settings
async function fetchAndLogSettings() {
    var sessionID = sessionStorage.getItem("SessionID");
    let blnError = false;

    if (!sessionID) {
        return;
    }
    
    var result = await getSettings();

    if (blnError) {
        return false;
    }

}

async function setSetting(setting, value) {
    if(setting == 'settingUsername'){
        $('#dashboardHeader').text(value + "\'s Farm");
    } else if(setting == 'settingDarkMode'){
        if(value == 'true'){
            $('body').removeClass('lightmode');
            $('body').addClass('darkmode'); 
            $('.btn').each(function() {
                if ($(this).hasClass('btn-primary') || $(this).hasClass('btn-icon')) {
                    $(this).addClass('btn-dark');
                }
            })
            $('p, h1, h2, h3, h4, h5, h6, span, a, label').addClass('text-white');
            $('.card').addClass('bg-dark');
            $('.card').css('border-color', 'grey');
        } else {
            $('body').removeClass('darkmode');
            $('body').addClass('lightmode');
            $('.btn').each(function() {
                if ($(this).hasClass('btn-primary') || $(this).hasClass('btn-icon')) {
                    $(this).removeClass('btn-dark');
                }
            })
            $('p, h1, h2, h3, h4, h5, h6, span, a, label').removeClass('text-white');
            $('.card').removeClass('bg-dark');
            $('.card').css('border-color', '');
        }  
    } else if (setting == 'settingCoopTemp'){
        
    } else if (setting == 'settingDoorOpen'){

    } else if(setting == 'settingColorBlind'){
        
    }
}

// Function to save or update a setting
$('#saveSettings').on('click', function () {
    var sessionID = sessionStorage.getItem("SessionID");
    let blnError = false;
    $('#divSettings input, #divSettings select').each(function() {

        var settingName = $(this).attr('id');

        if ($('#' + settingName).attr('type') == 'checkbox' || $('#' + settingName).attr('type') == 'radio') {
            // Skip this one
        } else {
            var settingName = $(this).attr('id');
            var value = $(this).val();

            if (value.length < 1) {
                blnError = true;
            }
        }
    })
    if (blnError) {
        Swal.fire({
            title: "Error!",
            text: "Fields cannot be blank!",
            icon: "error"
        })
        return
    }
    $('#divSettings input, #divSettings select').each(function() {
        let blnError = false;
        var settingName = $(this).attr('id');
        if ($('#' + settingName).attr('type') == 'checkbox' || $('#' + settingName).attr('type') == 'radio') {
            // Print out if it's checked
            if($(this).prop('checked')){
                var value = true;
            } else {
                var value = false;
            }
            console.log(value);
            
            $.ajax({
                type: 'GET',
                url: 'https://simplecoop.swollenhippo.com/settings.php',
                data: {
                    SessionID: sessionID,
                    setting: settingName
                },
                success: function(result) {
                    result = JSON.parse(result);
                    if (result) {
                        $.ajax({
                            type: 'PUT',
                            url: 'https://simplecoop.swollenhippo.com/settings.php',
                            data: {
                                SessionID: sessionID,
                                setting: settingName,
                                value: value
                            },
                            success: function(result) {
                                console.log(result);
                                setSetting(settingName, value);
                            },
                            error: function() {
                                blnError = true;
                            }
                        })
                    }
                    else {
                        $.ajax({
                            type: 'POST',
                            url: 'https://simplecoop.swollenhippo.com/settings.php',
                            data: {
                                SessionID: sessionID,
                                setting: settingName,
                                value: value
                            },
                            success: function(result) {
                                console.log(result);
                                setSetting(settingName, value);
                            },
                            error: function() {
                                blnError = true;
                            }
                        })
                    }
                },
                error: function() {
                    blnError = true;
                }
            })
        } else {
            // For other input/select types, just print out the value
            var value = $(this).val();

            if (value.length > 1) {
                $.ajax({
                    type: 'GET',
                    url: 'https://simplecoop.swollenhippo.com/settings.php',
                    data: {
                        SessionID: sessionID,
                        setting: settingName
                    },
                    success: function(result) {
                        result = JSON.parse(result);
                        if (result) {
                            $.ajax({
                                type: 'PUT',
                                url: 'https://simplecoop.swollenhippo.com/settings.php',
                                data: {
                                    SessionID: sessionID,
                                    setting: settingName,
                                    value: value
                                },
                                success: function(result) {
                                    console.log(result);
                                    setSetting(settingName, value);
                                },
                                error: function() {
                                    blnError = true;
                                }
                            })
                        }
                        else {
                            $.ajax({
                                type: 'POST',
                                url: 'https://simplecoop.swollenhippo.com/settings.php',
                                data: {
                                    SessionID: sessionID,
                                    setting: settingName,
                                    value: value
                                },
                                success: function(result) {
                                    console.log(result);
                                    setSetting(settingName, value);
                                },
                                error: function() {
                                    blnError = true;
                                }
                            })
                        }
                    },
                    error: function() {
                        blnError = true;
                    }
                })
            } else {
                return false;
            }
        }

        if (!blnError) {
            Swal.fire({
                title: "Success!",
                text: "Settings have been successfully updated!",
                icon: "success"
            })
        } else {
            Swal.fire({
                title: "Oops!",
                text: "There was an error updating the settings!",
                icon: "error"
            })
        }
    })
    $('#divSettings').slideToggle(function(){
        $('#divDashboard').slideToggle();
        fetchAndLogSettings();
    })
});

$('#btnLogout').on('click', function(){
    sessionStorage.removeItem("SessionID")
    $('#txtLoginEmail').val('');
    $('#txtLoginPassword').val('');
    $('#divDashboard').slideToggle(function(){
        $('#divLogin').slideToggle();
    })
})
         
$('.btnToggle').on('click',function(){
    let strCard = $(this).attr('data-card');
    if(strCard == 'Login'){
        $('#divLogin').slideToggle(function(){
            $('#divRegister').slideToggle();
        })
    } else {
        $('#divRegister').slideToggle(function(){
            $('#divLogin').slideToggle();
        })
    }
})

$('#btnReset').on('click', function(){
    $('#txtFirstName').val('');
    $('#txtLastName').val('');
    $('#txtEmail').val('');
    $('#txtPassword').val('');
    $('#txtStreetAddress1').val('');
    $('#txtStreetAddress2').val('');
    $('#txtCity').val('');
    $('#txtState').val('');
    $('#txtZip').val('');
    $('#telPhoneNum').val('');
    $('#txtCoopID').val('');
})

$('#btnLogin').on("click", function () {
    let strEmail = $('#txtLoginEmail').val().trim();
    let strPassword = $('#txtLoginPassword').val().trim();
    blnError = false
    htmlError = ''
    
    if (!strEmail.match(regexEmail)){
        blnError = true
        htmlError += "<p>Email is invalid<p>"
    } 
    if (!strPassword.match(regexPassword)){
        blnError = true
        htmlError += '<p>Password must contain 8 characters, 1 uppercase, 1 lowercase, and 1 number.</p>'
    }  
    if(blnError){
        Swal.fire({
            title: "Oops!",
            html: htmlError,
            icon: "error"
        });
    } else {
        $.post('https://simplecoop.swollenhippo.com/sessions.php',{Email:strEmail,Password:strPassword},function(result){
            result = JSON.parse(result)
            if(result.Outcome == 'false'){
                Swal.fire({
                    title: "Oops!",
                    text: result.Error,
                    icon: "error"
                })
            } else {
                sessionStorage.setItem("SessionID",result.SessionID)
                $("#divLogin").slideToggle(function(){
                    $("#divDashboard").slideToggle()
                })
                populateEnviromentChart();
                populateEnvironmentDropbox();
                populateEggChart();
                fetchAndLogSettings();
            }
        })
    }
});
        
$('#btnRegister').on('click',function(){
    let blnError = false;
    let strError = '';
    
    let strFirstName = $('#txtFirstName').val().trim();
    let strLastName = $('#txtLastName').val().trim();
    let strEmail = $('#txtEmail').val().trim();
    let strPassword = $('#txtPassword').val().trim();
    let strStreetAddress1 = $('#txtStreetAddress1').val().trim();
    let strStreetAddress2 = $('#txtStreetAddress2').val().trim();
    let strCity = $('#txtCity').val().trim();
    let strState = $('#txtState').val().trim();
    let strZip = $('#txtZip').val().trim();
    let intPhoneNum = $('#telPhoneNum').val().trim();
    let strCoopID = $('#txtCoopID').val().trim();
    
    const url = `https://maps.googleapis.com/maps/api/geocode/json` // API variables for geocode address validation
    const api_key = `AIzaSyArF_datI8_9ssGUGdPYXasftsOR7-R3D4`
    const address = strStreetAddress1 + `, ` + strCity + `, ` + strState;
    const address2 = strStreetAddress2 + `, ` + strCity + `, ` + strState;
    
    if(strFirstName.length <1){
        blnError = true;
        strError += '<p>First name cannot be blank.</p>'
    }
    if(strLastName.length <1){
        blnError = true;
        strError += '<p>Last name cannot be blank.</p>'
    }
    if(!strEmail.match(regexEmail)){
        blnError = true
        strError += '<p>Email is not valid.<p>'
    }
    if(!strPassword.match(regexPassword)){
        blnError = true;
        strError += '<p>Password must contain 8 characters, 1 uppercase, 1 lowercase, and 1 number.</p>'
    }
    if(strStreetAddress1.length <1){
        blnError = true;
        strError += '<p>Street Address 1 cannot be blank.</p>'
    } else {
        $.getJSON(url, {address: address, key:api_key}, function(result) {
            if (result.status != "OK") {
                blnError = true;
                strError += "Address 1 could not be verified. "
            } else {
                let found = false;
                if (result.results[0]["address_components"].length > 0) {
                    result.results[0]["address_components"].forEach(function(component) {
                        if (component.types) {
                            component.types.forEach(function(type) {
                                if (type == 'route') {
                                    console.log("Found valid address!")
                                    found = true;
                                }
                            })
                        }
                    })
                    if (!found) {
                        console.log("Could not find address")
                        blnError = true;
                        strError += "Address 1 could not be verified. ";
                    }
                }
            }
        })
    }
    if(strCity.length <1){
        blnError = true;
        strError += '<p>City cannot be blank.</p>'
    }
    if(strState.length <1){
        blnError = true;
        strError += '<p>State cannot be blank.</p>'
    }
    if(strZip.length < 5 || strZip.length > 5){
        blnError = true;
        strError += '<p>Zip code cannot be blank.</p>'
    }    
    if (strStreetAddress2.length > 0) {
        $.getJSON(url, {address: address2, key:api_key}, function(result) {
            if (result.status != "OK") {
                blnError = true;
                strError += "Address 2 could not be verified. ";
            } else {
                let found = false;
                if (result.results[0]["address_components"].length > 0) {
                    result.results[0]["address_components"].forEach(function(component) {
                        if (component.types) {
                            component.types.forEach(function(type) {
                                if (type == 'route') {
                                    found = true;
                                }
                            })
                        }
                    })
                }
                if (!found) {
                blnError = true;
                strError += "Address 2 could not be verified. ";
            }
            }
        })
    }
    if(intPhoneNum.length <1){
        blnError = true;
        strError += '<p>Phone number cannot be blank.</p>'
    }
    if(strCoopID.length <1){
        blnError = true;
        strError += '<p>Invalid CoopID.</p>'
    } 

    if(blnError == true){
        Swal.fire({
            title: "Oops!",
            html: strError,
            icon: "error"
        });
    } else {
        $.post('https://simplecoop.swollenhippo.com/users.php', {Email:strEmail,Password:strPassword,FirstName:strFirstName,LastName:strLastName,CoopID:strCoopID},function(result){
            result = JSON.parse(result)
            if(result.Error){
                Swal.fire({
                    title: "Oops!",
                    html: '<p>' + result.Error + '</p>',
                    icon: "error"
                });
            } else { 
                $.post('https://simplecoop.swollenhippo.com/useraddress.php', {Email:strEmail,Street1:strStreetAddress1,Street2:strStreetAddress2,City:strCity,State:strState,ZIP:strZip},function(result2){
                    result = JSON.parse(result2)
                    if(result.Error){
                        Swal.fire({
                            title: "Oops!",
                            html: '<p>' + result.Error + '</p>',
                            icon: "error"
                        });
                    } else {
                        $.post('https://simplecoop.swollenhippo.com/sessions.php',{Email:strEmail,Password:strPassword},function(result3){
                            result = JSON.parse(result3)
                            if(result.Error){
                                Swal.fire({
                                    title: "Oops!",
                                    text: result.Error,
                                    icon: "error"
                                });
                            } else {
                                sessionStorage.setItem("SessionID",result.SessionID)
                                $("#divRegister").slideToggle(function(){
                                    $("#divDashboard").slideToggle()
                                })
                            }
                        })
                    }
                })
            }
        })
             
    }
})

// environment.php start
$('#btnSubmitWeather').on("click", function () {
    const sessionId = sessionStorage.getItem("SessionID");
    const observationDateTime = $('#dateObservation').val();
    const temperature = $('#decimalTemp').val();
    const humidity = $('#decimalHumidity').val();

    // Check if any field is empty
    if (!sessionId || !observationDateTime || !temperature || !humidity) {
        // Display error message using SweetAlert2
        Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: 'Please fill in all fields before submitting.'
        });
        return; // Stop further execution if fields are empty
    }

    // Generate a random logID
    const logID = Math.floor(Math.random() * 1000);

    // Set the SessionID, observationDateTime, temperature, humidity, and logID
    var requestData = {
        SessionID: sessionId,
        observationDateTime: observationDateTime,
        temperature: temperature,
        humidity: humidity,
        logID: logID
    };

    // Making the AJAX request using POST for each observation
    $.ajax({
        url: 'https://simplecoop.swollenhippo.com/environment.php',
        method: 'POST',
        data: requestData,
        success: function (result) {
            // Show success message using SweetAlert2
            Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: 'Observation submitted successfully.'
            }).then(() => {
                // Clear the form after successful submission
                $('#dateObservation').val('');
                $('#decimalTemp').val('');
                $('#decimalHumidity').val('');
                populateEnviromentChart();
            });
        },
        error: function (xhr, status, error) {
            // Show error message using SweetAlert2
            Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: 'Failed to submit observation. Please try again.'
            });
            console.error('Error:', error);
        }
    });
});


$('#btnDeleteWeather').on('click', function() {
    // Get the selected value from the dropdown
    var sessionId = sessionStorage.getItem("SessionID");
    var selectedLogID = $('#selWeather').val();
    var sessionId = sessionStorage.getItem("SessionID");

    // Check if a log is selected
    if (selectedLogID) {
        // Perform AJAX request to delete the selected log
        $.ajax({
            url: 'https://simplecoop.swollenhippo.com/environment.php',
            method: 'DELETE', 
            data: { logID: selectedLogID, SessionID:sessionId },
            success: function(response) {
                // Assuming the deletion was successful
                console.log('Log deleted successfully');
                console.log(response);
                // Remove the selected entry from the list
                $('#selWeather option[value="' + selectedLogID + '"]').remove();
                // Show SweetAlert for success
                Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: 'Log deleted successfully!',
                }).then(() => {
                    populateEnviromentChart();
            });
            },
            error: function(xhr, status, error) {
                console.error('Error deleting log:', error);
                // Show SweetAlert for error
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Error deleting log: ' + error,
                });
            }
        });
    } else {
        // Display an error message if no log is selected
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Please select a log to delete.',
        });
    }
});

function populateEnviromentChart(){

    // Check if the chart already exists and destroy it
    let existingChart = Chart.getChart("myChart");
    if (existingChart) {
        existingChart.destroy();
    }

    // set up and display environment chart
    let SessionID = sessionStorage.getItem("SessionID");
    let days = 5; // Can be changed if needed
    $.ajax({
        url: 'https://simplecoop.swollenhippo.com/environment.php',
        method: 'GET',
        data: { SessionID: SessionID, days: days },
        success: function(data) {
            data = JSON.parse(data);
            data.sort(function(a, b) {
                // Use localeCompare for string comparison
                return a.ObservationDateTime.localeCompare(b.ObservationDateTime);
            });
            var temperatures = data.map(obj => ({y:parseFloat(obj.Temperature),x:obj.ObservationDateTime.split(' ')[0]}));
            var humidities = data.map(obj => ({y:parseFloat(obj.Humidity),x:obj.ObservationDateTime.split(' ')[0]}));
            
            var ctx = document.getElementById('myChart').getContext('2d');
            var environmentChart = new Chart(ctx, {
                type: 'line',
                data: {
                    datasets: [
                        {
                            label: 'Temperature (F)',
                            data: temperatures,
                            borderColor: 'rgba(255, 99, 132, 1)',
                            backgroundColor: 'rgba(255, 99, 132, 0.2)',
                            pointRadius: 6
                        },
                        {
                            label: 'Humidity (%)',
                            data: humidities,
                            borderColor: 'rgba(54, 162, 235, 1)',
                            backgroundColor: 'rgba(54, 162, 235, 0.2)',
                            pointRadius: 6
                        },
                    ],
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: true,
                        },
                    },
                },
            });
        },
        error: function(xhr, status, error) {
            console.error('Error:', error);
        }
    });
}

function populateEnvironmentDropbox(){
    // Populate delete weather dropbox
    let SessionID = sessionStorage.getItem("SessionID")
    days = 5 //Can be changed if needed
    $.ajax({
        url: 'https://simplecoop.swollenhippo.com/environment.php',
        method: 'GET',
        data: { SessionID: SessionID, days: days },
        success: function(data) {
            data = JSON.parse(data);
            // Populate delete weather dropbox
            var dropdown = $('#selWeather');

            // Clear existing options
            dropdown.empty();

            // Iterate through each object in the data array
            data.forEach(obj => {
                // Create a new option element
                var option = $('<option></option>');

                // Set the text and value of the option based on obj properties
                option.text(obj.ObservationDateTime + ' - Temp: ' + obj.Temperature + '°F, Humidity: ' + obj.Humidity + '%');
                option.val(obj.LogID); // Set the value to logID

                // Append the option to the dropdown
                dropdown.append(option);
            });
        },
        error: function(xhr, status, error) {
            console.error('Error:', error);
        }
    });
}

function populateEggChart(){

    // Check if the chart already exists and destroy it
    let existingChart = Chart.getChart("eggCountChart");
    if (existingChart) {
        existingChart.destroy();
    }

    // set up and display environment chart
    let SessionID = sessionStorage.getItem("SessionID");
    let days = 5; // Can be changed if needed
    $.ajax({
        url: 'https://simplecoop.swollenhippo.com/eggs.php',
        method: 'GET',
        data: { SessionID: SessionID, days: days },
        success: function(data) {
            data = JSON.parse(data);
            data.sort(function(a, b) {
                // Use localeCompare for string comparison
                return a.LogDateTime.localeCompare(b.LogDateTime);
            });
            var eggs = data.map(obj => ({y:parseFloat(obj.Harvested),x:obj.LogDateTime.split(' ')[0]}));   
            
            var ctx = document.getElementById('eggCountChart').getContext('2d');
            var eggChart = new Chart(ctx, {
                type: 'line',
                data: {
                    datasets: [
                        {
                            label: 'Egg Count',
                            data: eggs,
                            borderColor: 'rgba(255, 99, 132, 1)',
                            backgroundColor: 'rgba(255, 99, 132, 0.2)',
                            pointRadius: 6,
                        },
                    ],
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: true,
                        },
                    },
                },
            });

            // Populate delete weather dropbox
            var dropdown = $('#selEggs');

            // Clear existing options
            dropdown.empty();

            // Iterate through each object in the data array
            data.forEach(obj => {
                // Create a new option element
                var option = $('<option></option>');

                // Set the text and value of the option based on obj properties
                option.text(obj.LogDateTime + ', Eggs: ' + obj.Harvested);
                option.val(obj.LogID); // Set the value to logID

                // Append the option to the dropdown
                dropdown.append(option);
            });
        },
        error: function(xhr, status, error) {
            console.error('Error:', error);
        }
    });
}

// eggs.php post
$('#btnSubmitEggs').on("click", function () {
    const sessionId = sessionStorage.getItem("SessionID");
    const observationDateTime = $('#dateObservationEggs').val();
    const eggNum = $('#numEggCount').val();

    // Set the data
    var requestData = {
        SessionID: sessionId,
        observationDateTime: observationDateTime,
        eggs: eggNum
    };

    // Making the AJAX request using POST for each observation
    $.ajax({
        url: 'https://simplecoop.swollenhippo.com/eggs.php',
        method: 'POST',
        data: requestData,
        success: function (result) {
            populateEggChart();
            $('#dateObservationEggs').val('');
            $('#numEggCount').val('');
        },
        error: function (xhr, status, error) {
            console.error('Error:', error);
        }
    });
});

$('#btnDeleteEgg').on('click', function() {
    // Get the selected value from the dropdown
    var selectedLogID = $('#selEggs').val();
    var sessionId = sessionStorage.getItem("SessionID");

    // Check if a log is selected
    if (selectedLogID) {
        // Perform AJAX request to delete the selected log
        $.ajax({
            url: 'https://simplecoop.swollenhippo.com/eggs.php',
            method: 'DELETE', 
            data: { logID: selectedLogID, SessionID: sessionId },
            success: function(response) {
                // Assuming the deletion was successful
                console.log('Log deleted successfully');
                // Remove the selected entry from the list
                $('#selEggs option[value="' + selectedLogID + '"]').remove();
                // Show SweetAlert for success
                Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: 'Log deleted successfully!',
                });
                populateEggChart();
            },
            error: function(xhr, status, error) {
                console.error('Error deleting log:', error);
                // Show SweetAlert for error
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Error deleting log: ' + error,
                });
            }
        });
    } else {
        // Display an error message if no log is selected
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Please select a log to delete.',
        });
    }
});

$('#btnSettings').on('click',function(){
    $('#divDashboard').slideToggle(function(){
        $('#divSettings').slideToggle();
        fetchAndLogSettings();
    })
})

$('#btnReturnDashboard').on('click',function(){
    $('#divSettings').slideToggle(function(){
        $('#divDashboard').slideToggle();
    })
})
