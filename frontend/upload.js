
let apigClient = apigClientFactory.newClient()
let custom_labels = []
let upload_endpoint = 'https://zp5i5nwx53.execute-api.us-east-1.amazonaws.com/dev/upload/'

function displayLabels() {
    let labels_container = $("#custom-labels")
    labels_container.empty()
    $.each(custom_labels, function(i, cur_label) {
        let cur_container = $("<div class='row col-12'>")
        let label_text = $("<div class='col-8'>")
        label_text.html(cur_label)
        let label_delete_btn = $("<button class='btn btn-danger col-4'>")
        label_delete_btn.click(function() {
            custom_labels.splice(i, 1)
            displayLabels()
        })
        label_delete_btn.html("X")
        cur_container.append(label_text, label_delete_btn)
        labels_container.append(cur_container)
    })
}

$(document).ready(function() {
    $("#add-label").click(function() {
        cur_label = $("#custom-label").val()
        if (cur_label != null && cur_label != "") {
            custom_labels.push(cur_label)
        }
        console.log(custom_labels)
        displayLabels()
    })

    $("#upload-image").change(function(e) {
        const file = this.files[0]
        $("#upload-file-label").html(file.name)
    })

    $("#upload-button").click(function() {
        console.log("uploading")
        const file = $("#upload-image")[0].files[0]
        let fr = new FileReader()
        fr.onload = function(e) {
            const data = this.result
            const params = {
                "item" : file.name,
                "customlabels" : custom_labels
            }
            const additionalParams = {
                headers: {
                    'Content-Type': 'application/json'
                }
            }

            body = data
            console.log("len: " + body.length)
            const url = upload_endpoint + file.name
            $.ajax({
                url: url,
                processData:false,
                contentType: "image/jpeg",
                data: body,
                type: 'PUT',
                success : function(result) {
                    console.log("success")
                    $("#result-container").html("Success: " + file.name)
                    console.log(result)


                },
                failure : function(result) {
                    console.log("failure")
                    $("#result-container").html("Failure")
                    console.log(result)
                }
            })
            // apigClient.uploadItemPut(params, body, additionalParams).then(function(result) {
            //     console.log("success")
            //     $("#result-container").html("Success: " + file.name)
            //     console.log(result)
            // }).catch (function(result) {
            //     $("#result-container").html("Failure: " + result)
            //     console.log("failure")
            //     console.log(result)
            // })
        }
        fr.readAsArrayBuffer(file, 'ascii')
    })

    const file = $("#upload-image")[0].files[0]
    $("#upload-file-label").html(file.name)

})
