---
---
// builds lunr
var index = lunr(function () {
    this.field('messagetext', { boost: 10 })
    this.field('username')
    this.ref('id')
});
{% assign count = 0 %}
{% for channel in site.data.channels %}
    {% assign channelname = channel.name %}
    {% for days_hash in site.data[channelname] %}
        {% assign day = days_hash[1] %}
        {% for message in day %}
            index.add({
            id: {{count}},
            messagetext: {{message.text | slack_message | strip_html | jsonify}},
            {% if message.user != "" %}username: {{message.user | user_name | jsonify }},{% endif %}
            });
            {% assign count = count | plus: 1 %}
        {% endfor %}
    {% endfor %}
{% endfor %}
// builds reference data
var store = [{% for channel in site.data.channels %}
    {% assign channelname = channel.name %}
    {% for days_hash in site.data[channelname] %}
        {% assign day = days_hash[1] %}
        {% for message in day %}{
            "messagetext": {{ message.text | slack_message | markdownify | jsonify }},
            {% if message.user != "" %}"username": {{message.user | user_name | jsonify }},{% endif %}
            {% if message.user != "" %}"userimg": {{ message.user | user_img | jsonify }},{% endif %}
            "messagets": {{ message.ts }},
            "channel": {{ channelname | jsonify}},
            "messagetime": {{ message.ts | slack_timestamp | date: "%Y-%m-%d (%r)" | jsonify }},
            "client_msg_id": {{ message.client_msg_id | jsonify}}
        },
{% endfor %}
{% endfor %}
{% endfor %}]
// builds search
$(document).ready(function() {
  $('input#search').on('keyup', function () {
    var resultdiv = $('#results');
    // Get query
    var query = $(this).val();
    // Search for it
    var result = index.search(query);
    // Show results
    resultdiv.empty();
    // Add status
    resultdiv.prepend('<p class="">Found '+result.length+' result(s)</p>');
    // Loop through, match, and add results
    for (var item in result) {
      var ref = result[item].ref;
      var searchitem = '<div> <img src="'+store[ref].userimg+'" /> <div class="message" id="'+store[ref].messagets+'"> <div class="username">'+store[ref].username+'</div> <div class="time"><a href="/'+store[ref].channel+'#'+store[ref].messagets+'">'+store[ref].messagetime+'</a></div> <div class="msg">'+store[ref].messagetext+'</div> </div> </div> <br/>';

      resultdiv.append(searchitem);
    }
  });
});
