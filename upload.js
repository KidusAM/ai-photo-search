
let custom_labels = []

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
})
