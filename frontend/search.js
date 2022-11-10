
var apigClient = apigClientFactory.newClient()

function display_images(images) {
    let results_container = $("#results-container")
    results_container.empty()
    $.each(images, function(i, cur_img) {
        let item = $("<img class='col-4 result-image'>")
        item.attr("src", cur_img.url)
        results_container.append(item)
    })
}

$(document).ready(function() {
    $("#search-button").click(function (e) {
        const search_text = $("#search-query").val()
        const params = {
            "q" : search_text
        }

        apigClient.searchGet(params, {}, {})
            .then(function(result) {
                console.log(result)
                display_images(result.data.results)
            })
            .catch(function(result) {
                console.log("Error: " + result)
            })
    })
})
