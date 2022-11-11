
var apigClient = apigClientFactory.newClient({
    apiKey: 'wGsNLVgqNZTCPoRnVUs79yjKEo7l2wF3xeOGV8Ed'
})

function display_images(images) {
    let results_container = $("#results-container")
    results_container.empty()
    $.each(images, function(i, cur_img) {
        let item = $("<img class='col-4 result-image'>")
        item.attr("src", cur_img.url)
        results_container.append(item)
    })
}

let first_click = true
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
    $("#record-button").click(function(e) {
        console.log("start recording")
        let text = getSpeechText()
        console.log("speech is ")
        console.log(text)
    })

})

function getSpeechText() {
  var transcript;
  var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition;
  var recognition = new SpeechRecognition();

  recognition.onstart = function() {

  };

  recognition.onspeechend = function() {
      recognition.stop();
  }

  // This runs when the speech recognition service returns result
  recognition.onresult = function(event) {
      transcript = event.results[0][0].transcript;
      console.log("got transcript")
      console.log(transcript)
      $("#search-query").val(transcript)
  };

  recognition.start();
  return transcript
}
