(function (global) {
  // add a style tag to the head
  var styleTag = document.createElement("link");
  styleTag.rel = "stylesheet";
  styleTag.type = "text/css";
  styleTag.href =  "http://cdn.41q.com/api/v1.css";
  styleTag.media = "all";
  document.getElementsByTagName('head')[0].appendChild(styleTag);

  styleTag = document.createElement("link");
  styleTag.rel = "stylesheet";
  styleTag.type = "text/css";
  styleTag.href =  "http://cdn.41q.com/api/cleanslate/cleanslate.css";
  styleTag.media = "all";
  document.getElementsByTagName('head')[0].appendChild(styleTag);

  // Create a div
  var div = document.createElement('div');
  div.id = 'api-41q-widget-wrapper';
  div.className = 'cleanslate api-41q-widget-wrapper';

  var scriptTags = document.getElementsByTagName('script');
  var scriptTag;

  for(var i = 0; i < scriptTags.length; i++) {
    if (scriptTags[i].id === 'api-41q-widget') {
      scriptTag = scriptTags[i];
    }
  }

  scriptTag.parentNode.insertBefore(div, scriptTag);

  global.API_41Q = {
    client_id: '',
    client_public_key: '',
    lang: 'en',
    url: 'http://api.41q.com/v1/',
    _current_question: 1,
    request: function(action, config, callback) {
      var xmlhttp;
      // compatible with IE7+, Firefox, Chrome, Opera, Safari
      xmlhttp = new XMLHttpRequest();
      xmlhttp.onreadystatechange = function(){
          if (xmlhttp.readyState == 4 && xmlhttp.status == 200){
              callback(JSON.parse(xmlhttp.responseText));
          }
      }
      config.response_format = 'json';
      config.client_id = this.client_id;
      config.client_public_key = this.client_public_key;
      config.lang = this.lang;

      xmlhttp.open("POST", (this.url + action + '.json'), true);
      xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
      xmlhttp.send(JSON.stringify(config));
    },
    questions: function(config, cb) {
      this.request('questions', config, cb);
    },
    result: function(config, cb) {
      this.request('result', config, cb);
    },

    render_result: function(config) {
      this.result(config, function(data) {
        var html = '';

        html+= '<div class="api-41q-result-wrapper">';
        html+= '<p class="api-41q-result-title">' + data.title + '</p>';
        html+= '<p class="api-41q-result-description">' + data.description + '</p>';
        html+= '<p class="api-41q-result-jobs"><b>Suitable jobs:</b> ' + data.jobs + '</p>';
        html+= '<p class="api-41q-result-famous"><b>Famous people with the same personality type:</b>';
        html+= '<ul>';
        for (var i in data.famous_people) {
          var f = data.famous_people[i];
          html+= '<li>' + f[0] + ', ' + f[1] + '</li>';
        }
        html+= '</ul>';
        html+= '</p>';
        html+= '</div>';

        html+= '<p class="api-41q-labeled">Powered by <a href="http://www.41q.com">41Q.com</a></p>';
        div.innerHTML = html;
      });
    },

    render_questions: function(config) {
      this.questions(config, function(data) {
        var html = '';

        var count = 0;
        for (var i in data) {
            if (data.hasOwnProperty(i)) {
                count++;
            }
        }

        var nextQuestion = function(alsoHideThis) {
          var o = document.getElementById('api-41q-question-wrapper-' + global.API_41Q._current_question);
          if (o) {
            o.className = 'api-41q-question-wrapper api-41q-question-wrapper-hidden';
          }

          if (alsoHideThis) {
            var a = document.getElementById('api-41q-question-wrapper-' + alsoHideThis);
            a.className = 'api-41q-question-wrapper api-41q-question-wrapper-hidden';
          }

          ++global.API_41Q._current_question;

          var n = document.getElementById('api-41q-question-wrapper-' + global.API_41Q._current_question);
          if (n) {
            n.className = 'api-41q-question-wrapper';
          } else {
            var c = {};
            var i = 1;
            while (i < global.API_41Q._current_question) {
              var radios = document.getElementsByName('q' + i);
              c['q' + i] = (radios[0].checked ? 1 : 2);
              ++i;
            }

            c.response_parts = 'title+description+jobs+famous_people+bars';
            div.innerHTML = '<div class="api-41q-loading-wrapper"><h2>Loading results...</h2></div>';
            setTimeout(function() {
              global.API_41Q.render_result(c);
            }, 2500);

          }
        };

        var ids = [];

        for (var i in data) {
          var q = data[i];
          if (parseInt(i) === 1) {
            html+= '<div id="api-41q-question-wrapper-'+i+'" class="api-41q-question-wrapper">';
          } else {
            html+= '<div id="api-41q-question-wrapper-'+i+'" class="api-41q-question-wrapper api-41q-question-wrapper-hidden">';
          }
          html+= '<p class="api-41q-no">Personality Test Question <b>' + q.no + '</b> of <b class="api-41q-no-total">' + count + '</b>.</p>';
          html+= '<p class="api-41q-question">';
          html+= '<b class="api-41q-header">' + q.question + '</b>';
          html+= '</p>';
          html+= '<label id="for-q-'+i+'-1" for="q-'+i+'-1" class="api-41q-answer api-41q-answer-1"><input type="radio" name="q'+i+'" id="q-'+i+'-1" value="1" /> ' + q.answers[1].answer + '</label>';
          html+= '<label id="for-q-'+i+'-2" for="q-'+i+'-2" class="api-41q-answer api-41q-answer-2"><input type="radio" name="q'+i+'" id="q-'+i+'-2" value="2" /> ' + q.answers[2].answer + '</label>';
          html+= '</div>';
          ids.push('for-q-'+i+'-1');
          ids.push('for-q-'+i+'-2');
        }

        html+= '<p class="api-41q-controls"><a href="#" id="previous-question">Previous question</a>';
        html+= '<a href="#" id="start-from-first-question">Start over</a>';
        html+= '<a href="#" id="help-question">Help</a></p>';
        html+= '<p class="api-41q-labeled">Powered by <a href="http://www.41q.com">41Q.com</a></p>';
        div.innerHTML = html;

        document.getElementById('previous-question').addEventListener('click', function(e) {
          var alsoHideThis = global.API_41Q._current_question;
          global.API_41Q._current_question = global.API_41Q._current_question - 2;
          if (global.API_41Q._current_question < 0) {
            global.API_41Q._current_question = 0;
          }
          nextQuestion(alsoHideThis);
        });

        document.getElementById('start-from-first-question').addEventListener('click', function(e) {
          var alsoHideThis = global.API_41Q._current_question;
          global.API_41Q._current_question = 0;
          nextQuestion(alsoHideThis);
        });

        for (var i in ids) {
          document.getElementById(ids[i]).addEventListener('click', function(e) {
            if (!e.srcElement.htmlFor) {
              setTimeout(nextQuestion, 50);
            }
          });
        }

      });
    }
  };

  if (global._API_41Q.length === 2) {
    API_41Q.client_id = _API_41Q[0][0];
    API_41Q.client_public_key = _API_41Q[0][1];
    API_41Q.lang = _API_41Q[0][2];
    API_41Q[_API_41Q[1][0]](_API_41Q[1][1]);
  } else {
    console.error('Not correct amount of arguments.');
  }

  
})(this);