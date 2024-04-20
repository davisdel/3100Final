var regexEmail = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/g
var regexPassword = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/g

var primaryColor = '';
var infoColor = '';

var toggling = false;

function getCSSVariableFromClass(className, variableName) {
    // Create a temporary element with the given class
    var tempElement = document.createElement('div');
    tempElement.className = className;
    document.body.appendChild(tempElement);

    // Get the computed style to access the CSS variable
    var value = getComputedStyle(tempElement).getPropertyValue(variableName);

    // Clean up by removing the temporary element
    document.body.removeChild(tempElement);

    return value.trim();  // Trim to remove any extra whitespace
}

$(document).ready(function(){

    if(sessionStorage.getItem("SessionID")){
        $.getJSON("https://simplecoop.swollenhippo.com/sessions.php", {SessionID:sessionStorage.getItem("SessionID")}, function(result){
            if(result != null){
                
                populateEnviromentChart();
                populateEggChart();
                fetchAndLogSettings();

                $('#divLogin').slideToggle(function(){
                    toggling = false;
                    $('#divDashboard').slideToggle();
                    $('.sidebar').attr("style", "");
                    $('.navbar').attr("style", "");
                    $('.solid-line').attr("style", "");
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

    $('#settingCoopHumidityInt').on('input', function() {
        $('#settingCoopHumidity').val($(this).val());
    });

    $('#settingCoopHumidity').on('input', function() {
        $('#settingCoopHumidityInt').val($(this).val());
    });

    toggling = true;
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
        $('#dashboardHeader').text(value);
    } else if(setting == 'settingDarkMode'){
        if(value == 'true'){
            $('body').removeClass('lightmode light');
            $('body').addClass('darkmode dark'); 
        } else {
            $('body').removeClass('darkmode dark');
            $('body').addClass('lightmode light');
        }  
    } else if (setting == 'settingCoopTemp'){
        $('#progressTemp').attr('style', 'width: ' + value + '%;');
        $('#tempLabel').html(`Coop Temperature: <b>${value} °F</b>`);
    } else if (setting == 'settingDoorOpen'){
        if(value == 'true'){
            $('#doorStatus').html('Open');
        } else {
            $('#doorStatus').html('Closed');
        }
    } else if (setting == 'settingLight'){
        if(value == 'true'){
            $('#lightStatus').html('On');
        } else {
            $('#lightStatus').html('Off');
        }
    } else if (setting == 'settingCoopHumidity'){
        $('#progressHumidity').attr('style', 'width: ' + value + '%;');
        $('#humidityLabel').html(`Coop Humidity: <b>${value}%</b>`);
    } else if (setting = 'settingTheme') {
        var element = $('body');

        // Function to check if the element has any class matching "theme-color-*"
        function findThemeColorClass(element) {
            var classList = element.attr('class').split(/\s+/);
            var pattern = /^theme-color-(.+)$/; // Updated to capture the color part
    
            for (var i = 0; i < classList.length; i++) {
                var match = pattern.exec(classList[i]);
                if (match) {
                    return match[1];  // Return the color part of the class
                }
            }
            return null; // Return null if no matching class found
        }
    
        // Example usage
        var color = findThemeColorClass(element);
        if (color) {
            element.removeClass('theme-color-'+color);
            element.addClass('theme-color-'+value);
        } else {
            element.addClass('theme-color-'+value);
        }

        var primaryColor = getCSSVariableFromClass('theme-color-'+value, '--bs-primary');
        var infoColor = getCSSVariableFromClass('theme-color-'+value, '--bs-info');

        $('#themeStatus').html(value.charAt(0).toUpperCase() + value.slice(1));

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

            if (value.length >= 1) {
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
        activeId = 'divDashboard';
        $('#divDashboard').slideToggle();
        fetchAndLogSettings();
    })
});

$('#btnLogout').on('click', function(){
    sessionStorage.removeItem("SessionID")
    $('#txtLoginEmail').val('');
    $('#txtLoginPassword').val('');

    $('#'+activeId).slideToggle(function(){
        $('#divLogin').slideToggle(function() {
            $('.sidebar').attr("style", "display: none;");
            $('.navbar').attr("style", "display: none;");
            $('.solid-line').attr("style", "display: none;");
        });

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
                    icon: "error"
                })
            } else {
                sessionStorage.setItem("SessionID",result.SessionID)
                fetchAndLogSettings();
                $("#divLogin").slideToggle(function(){
                    activeId='divDashboard';
                    $("#divDashboard").slideToggle()
                    $('.sidebar').attr("style", "");
                    $('.navbar').attr("style", "");
                    $('.solid-line').attr("style", "");
                })
                populateEnviromentChart();
                populateEggChart();
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
                                fetchAndLogSettings()
                                $('#divRegister').slideToggle(function(){
                                    activeId = 'divDashboard';
                                    $('#divDashboard').slideToggle();
                                });
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
    } else if (temperature < 0 || temperature > 250 || humidity < 0 || humidity > 100) {
        // Display error message using SweetAlert2
        Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: 'Temperature must be between 0 and 250 and Humidity must be between 0 and 100.'
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

            // Populate delete weather dropbox
            var dropdown = $('#selWeather');

            // Clear existing options
            dropdown.empty();
            var option = $('<option selected disabled>Please select an observation</option>');
            dropdown.append(option);

            // Iterate through each object in the data array
            data.forEach(obj => {
                // Create a new option element
                option = $('<option></option>');

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
            var option = $('<option selected disabled>Please select an observation</option>');
            dropdown.append(option);

            // Iterate through each object in the data array
            data.forEach(obj => {
                // Create a new option element
                option = $('<option></option>');

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

    // Check if any field is empty
    if (!sessionId || !observationDateTime || !eggNum) {
        // Display error message using SweetAlert2
        Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: 'Please fill in all fields before submitting.'
        });
        return; // Stop further execution if fields are empty
    }

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
            Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: 'Observation submitted successfully.'
            }).then(() => {
                // Clear the form after successful submission
                $('#dateObservationEggs').val('');
                $('#numEggCount').val('');
                populateEggChart();
            });
            
        },
        error: function (xhr, status, error) {
            Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: 'Failed to submit observation. Please try again.'
            });
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

// $('#btnSettings').on('click',function(){
//     $('#divDashboard').slideToggle(function(){
//         $('#divSettings').slideToggle();
//         fetchAndLogSettings();
//     })
// })

function hexToRGB(hex) {
    // Remove the hash at the beginning of the hex string if it's there
    hex = hex.replace(/^#/, '');

    // Parse the hex string into integers using parseInt
    let r = parseInt(hex.substring(0, 2), 16); // Extract the first two characters and convert to decimal
    let g = parseInt(hex.substring(2, 4), 16); // Extract the next two characters and convert to decimal
    let b = parseInt(hex.substring(4, 6), 16); // Extract the last two characters and convert to decimal

    // Return the RGB values as an object
    return { r, g, b };
}


$('#btnReturnDashboard').on('click',function(){
    switchActive('divDashboard');
})

var activeId = 'divDashboard';
$('.nav-link').on('click', function(){
    if (!toggling) {
        toggling = true;
        targetId = $(this).data('id');
        if (targetId == activeId) {
            $('#'+activeId).slideToggle(function(){
                activeId = 'divDashboard';
                $('#divDashboard').slideToggle();
                toggling = false;
            });
            return;
        }

        // if (targetId == "divSettings" || activeId == "divSettings") {
        //     fetchAndLogSettings();
        // }
        
        if (activeId != '') {
            var toggleType = $(this).data('type');
            if (toggleType == "toggle") {
                $('#'+targetId).slideToggle();
                toggling = false;
            } else if (!toggleType) {
                $('#'+activeId).slideToggle(function(){
                    activeId = targetId;
                    $('#'+targetId).slideToggle();
                    toggling = false;      
   
                });
            }
        }
    }

})

function switchActive(targetId) {
    if (!toggling) {
        toggling = true;
        $('#'+activeId).slideToggle(function(){
            activeId = targetId;
            $('#'+targetId).slideToggle();
            toggling=false;
        });
    }
}
