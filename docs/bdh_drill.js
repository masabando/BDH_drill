
var qlist = [];

function bdh() {
  var APP_NAME = 'bdh_drill.js';
  var VERSION = "0.1";

  var content = $('#BDH_drill');
  var question_container = $('#question_container')
  var question;
  var footer = $('#footer');
  var header = $('#header');
  var base_a = [2, 10, 16];
  var digit_size = 8;// 4*N
  var digit_msize = 4;// 4*M < digit_size
  var qnum = 100;

  // [Autoset Vars] ---------------------------------------------------
  var click_event = 'click';
  var smart_phone_flag = false;
  var num_range = {max: Math.pow(2,digit_size - 1) - 1,
                   min: -Math.pow(2,digit_size - 1)};
  var zfillstr = Array(digit_size + 1).join("0");
  // [for smart phone] ------------------------------------------------
  function agent_checker() {
    var agent = navigator.userAgent;
    if(agent.search(/iPhone/) != -1 || agent.search(/iPad/) != -1
       || agent.search(/iPod/) != -1 || agent.search(/Android/) != -1) {
      smart_phone_flag = true;
      click_event = "touchend";
      // $(window).on('touchmove', function(e) { e.preventDefault(); });
    }
  }
  // ------------------------------------------------------------------

  function get_rand(min, max) {
    return Math.floor((max - min + 1)*Math.random() + min);
  }

  function zerofill(str, base) {
    return (zfillstr + str).slice(base == 2 ? -8 : -2);
  }

  function bitflip(str) {
    return $.map(str.split(""), function(v, i) {
      if (i == 4) { return v; }
      return parseInt(v) == 0 ? "1" : "0";
    }).join("");
  }

  function add1(str) {
    var a = zerofill((parseInt(str.substr(0,4) + str.substr(5,4), 2) + 1)
                     .toString(2), 2);
    var b = str.charAt(4);
    return a.substr(0,4) + b + a.substr(4,4)
  }

  function get_random_bin(intflag) {
    var a = Array.apply(null, Array(digit_size))
      .map(function() { return get_rand(0,1); });
    a.splice(4, 0, intflag === 1 ? " " : ".");
    return a.join("");
  }


  function bin2hex(s) {
    return parseInt(s.substr(0, 4), 2).toString(16)
      + (s.charAt(4) === " " ? "" : ".")
      + parseInt(s.substr(5, 4), 2).toString(16);
  }

  function bin2dec(s) {
    if (s.charAt(4) === " ") {// 整数
      if (parseInt(s.charAt(0)) == 0) {// 正の整数
        return parseInt(s.substr(0, 4) + s.substr(5, 4), 2).toString(10);
      } else {// 負の整数
        b = add1(bitflip(s));
        return (-parseInt(b.substr(0, 4) + b.substr(5, 4), 2)).toString(10);
      }
    } else {// 小数
      if (parseInt(s.charAt(0)) == 0) {// 正の小数
        return parseInt(s.substr(0, 4), 2).toString(10)
          + '.'
          + ((parseInt(s.substr(5, 4), 2)*Math.pow(0.5, 4))
             .toString(10).split(".")[1] || "0");
      } else {// 負の小数
        var b = add1(bitflip(s));
        return '-' + parseInt(b.substr(0, 4), 2).toString(10)
          + '.'
          + ((parseInt(b.substr(5, 4), 2)*Math.pow(0.5, 4))
          .toString(10).split(".")[1] || "0");
      }
    }
  }

  function add_hook_event() {
    $('.qinput').change(function() {
alert(1);
      var n = $(this).parent().attr('id').split("_")[1];
      var user_ans = $(this).val();
      var ans = qlist[n].qans;
      var ansx = qlist[n].qans;
      if (ans.length == 9 && ans.charAt(4) === ' ') {
        ansx = ans.substr(0,4) + ans.substr(5,4);
      }
      if (ans === user_ans || ansx === user_ans) {
        $('.question').eq(n).css('background', '#aaf');
      } else {
        $('.question').eq(n).css('background', '#fff');
      }
    });
    // if (smart_phone_flag) {
    //   document.addEventListener('touchstart', event => {
    //     if (event.touches.length > 1) {
    //       event.preventDefault();
    //     }
    //   }, true);
    //   var lastTouch = 0;
    //   document.addEventListener('touchend', event => {
    //     const now = window.performance.now();
    //     if (now - lastTouch <= 500) {
    //       event.preventDefault();
    //     }
    //     lastTouch = now;
    //   }, true);
    // }
  }


  function create_question(i) {
    var iflag = get_rand(0,1);
    var qstr = get_random_bin(iflag);
    var from_i = get_rand(0,2);
    var from_base = base_a[from_i];
    var to_base = base_a[(from_i + get_rand(1,2)) % 3];
    var from_x, answer;
    switch(from_base) {
    case 2: from_x = qstr; break;
    case 10: from_x = bin2dec(qstr); break;
    case 16: from_x = bin2hex(qstr); break;
    }
    switch(to_base) {
    case 2: answer = qstr; break;
    case 10: answer = bin2dec(qstr); break;
    case 16: answer = bin2hex(qstr); break;
    }
    var q = {
      qvar: from_x,
      qfrom: from_base,
      qto: to_base,
      qans: answer
    };
    qlist.push(q);
    question_container.append(
      '<div class="question" id="question_' + i + '">'
        + '<div class="qid">' + (i < 10 ? '&ensp;' : '') + i + ':</div>'
        + '<div class="qvar">' + q.qvar + '</div>'
        + '<div class="qfromto">('
        + (q.qfrom == 2 ? '&ensp;' : '') + q.qfrom + '進-->'
        + (q.qto == 2 ? '&ensp;' : '') + q.qto + '進)</div>'
        + (smart_phone_flag ? '<div class="right">': '')
        + '<input class="qinput" type="text" name="qinput" value="">'
        + (smart_phone_flag ? '</div>': '')
        + '<div class="qans">(' + q.qans + ')</div>'
        + '</div>'
    );
  }

  function init() {
    agent_checker();
    footer.html(APP_NAME + " -- v." + VERSION);
    question_container.html("");
    for (var i = 0; i < qnum; i++) { create_question(i); }
    add_hook_event();
  }

  function go() {
    init();
  }

  go();
}

function show_answers() { $('.qans').css('visibility', 'visible'); }

function hide_answers() { $('.qans').css('visibility', 'hidden'); }

var print_mode_ans = false;
function print_mode(num) {
  print_mode_ans = !print_mode_ans;
  var nstr = ("0"+num).slice(-2);
  if (print_mode_ans) {
    $('.qinput').each(function() {
      $(this).val(qlist[$(this).parent().attr('id').split('_')[1]].qans);
    });
    $('#printnum').html(nstr + " 解答");
    $('title').text(nstr + "_ans");
  } else {
    $('.qinput').val("");
    $('#printnum').html(nstr);
    $('title').text(nstr);
  }
  $('.qans').css('display', 'none');
}

$(function() {
  bdh();
});
