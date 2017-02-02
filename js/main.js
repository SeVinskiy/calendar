;(function() {
  "use strict";

  //now - текущий момент времени
  var now = moment(),
      currentMonth,
      currentYear,
      currentMaxDayInMonth,
      firstDayMonth,
      currentNumWeek,
      eventInfo;

  //текущий месяц и год динамическое добавление в шапку
  var addCurrentMonthAndYear = function() {
      currentMonth = now.format('MMMM');
      currentYear = now.format('YYYY');
      currentMaxDayInMonth = now.daysInMonth();
      firstDayMonth = now.startOf('month');
      currentNumWeek = now.isoWeek();
      console.log(currentMonth + " - выбр месяц");
      console.log(currentMaxDayInMonth + " - макс кол дней выбр месяца");   // получение максимального кол.дней в месяце
      console.log(firstDayMonth.format('dd' + " - это первое число выбр месяца"));    //получ. дня недели выбранного месяца
      console.log(currentNumWeek + " - номер первой недели выбр месяца");
      createMasWeek();
      $(".currentMonth").text(currentMonth + ' , ' + currentYear);
  };

  addCurrentMonthAndYear(); //отображение текущего месяца

  //клики: переключение месяца
    $(".previousMonth").on("click", function () {
      now.subtract(1, 'months');
      addCurrentMonthAndYear();
      findEventInMonth();
    });

    $(".nextMonth").on("click", function () {
      now.add(1, 'months');
      addCurrentMonthAndYear();
      findEventInMonth();
    });

    //создание массивов месяцов
    function createMasWeek() {
      var Mas = [],
          emptyCells = 0;
      for (let i = 1; i <= currentMaxDayInMonth; i++) {
        Mas.push(i);
      }
      //определим кол.пустых ячеек
      switch (firstDayMonth.format('dd')) {
        case "Tu": emptyCells = 1; break;
        case "We": emptyCells = 2; break;
        case "Th": emptyCells = 3; break;
        case "Fr": emptyCells = 4; break;
        case "Sa": emptyCells = 5; break;
        case "Su": emptyCells = 6; break;
        default: break;
      }
      //цикл для добавления пустых ячеек в начале недели
      for (let i = 1; i <= emptyCells; i++) {
        Mas.unshift("");
      }
      // console.log(Mas);
      //режем массив на объект с неделями
      var Obj = {};
      for (let i = 0; Mas.length > 0; i++) {
        if (currentNumWeek == 52) {
          currentNumWeek -= 52;
        }
        Obj[`week${currentNumWeek + i}`] = Mas.slice(0, 7);
        Mas.splice(0, 7);
      }
      console.log(Obj);

      //наполняем календарь датами
      $("tr.dateLine").remove();  //сперва очистим данные предыдущих месяцев если они были
      $("tr.infoLine").remove();  //сперва очистим данные предыдущих событий если они были
      for (var key in Obj) {      //цикл для каждого массива объекта Obj
        $("table").append(`<tr class="forDelete dateLine"></tr>`);    //создаем новый ряд
              for (var i = 0; i < Obj[key].length; i++) {
                $(".forDelete").append(`<td> ${Obj[key][i]} </td>`);    //наполняем рад
              }
        $(".dateLine").removeClass("forDelete");      //чтобы каждый новый массив добавлялся в новую линию
      }
    }

    // Initialize Firebase
    var config = {
      apiKey: "AIzaSyAQJrqBC6bQ1Asnsx5EXMSye0XoUZXVhk4",
      authDomain: "testlevelup-87972.firebaseapp.com",
      databaseURL: "https://testlevelup-87972.firebaseio.com",
      storageBucket: "testlevelup-87972.appspot.com",
      messagingSenderId: "543438920294"
    };


    firebase.initializeApp(config);

    //запись в Firebase
    function writeUserData(year, month, day, time, eventText) {
      firebase.database().ref('event/' + year + '/' + month + '/' + day).set({
        time: time,
        eventText: eventText
      });
    }

    // writeUserData(2017, "January", 24, "18:00", "next brainstorm in Level Up");
    // writeUserData(2017, "January", 25, "21:00", "ice cream");
    // writeUserData(2016, "December", 30, "8:00", "buy a christmas tree");
    // writeUserData(2017, "February", 5, "06:00", "ice skating on the river Dnepr");
    // writeUserData(2017, "February", 23, "12:00", "defender of the Fatherland Day");

      function findEventInMonth() {
        //поиск событий в выбранном месяце
        if (!firebase.database().ref('event/' + currentYear).once("value")) return;
          else if(!firebase.database().ref('event/' + currentYear + '/' + currentMonth).once("value")) return;
            else firebase.database().ref('event/' + currentYear + '/' + currentMonth).once("value").then(function(snapshot) {
            var eventInfo = snapshot.val();
            console.log(eventInfo);

            //подсветка событий в выбранном месяце
            for (var key in eventInfo) {
              if(key < 10) $(`td:contains("${key}"):first`).addClass("dayWithEvent");  //иначе выбируться все числа содержащие данную цифру
                else $(`td:contains("${key}")`).addClass("dayWithEvent");
            }

            //клики по событиям в выбранном месяце
            $(`.dayWithEvent`).on("click", function() {
              $("tr.infoLine").remove();  //сперва очистим данные предыдущих событий если они были
              let clickedNumberDay = $(this).html();
              console.log(eventInfo[Number(clickedNumberDay)]["eventText"] + " at the " + eventInfo[Number(clickedNumberDay)]["time"]);
              $("table").append(`<tr class="infoLine">
                  <td colspan="2">${eventInfo[Number(clickedNumberDay)]["time"]}</td>
                  <td colspan="5">${eventInfo[Number(clickedNumberDay)]["eventText"]}</td>
                </tr>`
              );
            });
          });

      }

      findEventInMonth();



})();
