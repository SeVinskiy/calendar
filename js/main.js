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

      clear();

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

              clear();

              let clickedNumberDay = $(this).html();
              $("table").append(`<tr class="infoLine">
                  <td colspan="2" contenteditable="true"><div>${eventInfo[Number(clickedNumberDay)]["time"]}</div></td>
                  <td colspan="5" contenteditable="true"><div>${eventInfo[Number(clickedNumberDay)]["eventText"]}</div></td>
                </tr>`
              );

              deleteEv(clickedNumberDay);
              editEv(eventInfo, clickedNumberDay);
            });

            //клик по дню без события для дальнейшего добавления
            $(".dateLine > td:not(.dayWithEvent)").on("click", function() {
              var clickedNumberDay = $(this).html();

              clear();

              if (clickedNumberDay.trim() === "") return;
                else {
                  $("table").append(`
                    <tr class="addInfoLine">
                      <td colspan="2"><input type="text" placeholder="00:00 - 24:00"></input></td>
                      <td colspan="5"><textarea placeholder='put event for ${clickedNumberDay.trim()} ${currentMonth}'></textarea></td>
                    </tr>
                    <tr class="buttonLine">
                      <td colspan="7"><button>Add event</button></td>
                    </tr>
                    `);
                }

                //клик по кнопки для добавления события в базу farebase
                $("button").on("click", function(event) {
                  event.preventDefault();

                  var TimeInput = $(".addInfoLine input").val();

                  let ReTime = /^\d\d:\d\d$/gim;

                  if (!ReTime.test(TimeInput.trim())) {
                    alert("время не в том формате, нужно написать например 10:05");
                    return;
                  }

                  if (Number(TimeInput.substr(0, 2)) > 24) {
                    alert("не божет быть больше 24 часов в сутках");
                    return;
                  }

                  if (Number(TimeInput.substr(3, 2)) > 59) {
                    alert("не божет быть больше 60 минут в часе");
                    return;
                  }

                  var EventTextarea = $(".addInfoLine textarea").val();

                  if (EventTextarea.trim() === "") {
                    alert("в описании события нет ни одного символа");
                    return;
                  }

                  writeUserData(currentYear, currentMonth, clickedNumberDay.trim(), TimeInput.trim(), EventTextarea.trim());

                  clear();
                  findEventInMonth();
                });

            });
          });
      }

      function clear() {
        $("tr.addInfoLine").remove();
        $("tr.buttonLine").remove();
        $("tr.infoLine").remove();
      }


      function deleteEv(clickedNumberDay) {
        $("tr.infoLine td:last-child").append(`<span contenteditable="false" class="deleteIcon">х</span>`);

        $(".deleteIcon").on("click", () => {
          firebase.database().ref('event/' + currentYear + '/' + currentMonth + '/' + Number(clickedNumberDay)).remove();

          clear();
          $("td.dayWithEvent").removeClass("dayWithEvent");
          findEventInMonth();
        });
      };

      function editEv(eventInfo, clickedNumberDay) {
        $("tr.infoLine td:first-child").append(`<span contenteditable="false" class="editIcon"><img src="img/pen_white.png"</span>`);

        $(".editIcon").on("click", () => {
           let newTime = $("tr.infoLine > td:first-child").text(),
               newTextEv = $("tr.infoLine > td:last-child").text().slice(0, -1);

           firebase.database().ref('event/' + currentYear + '/' + currentMonth + '/' + Number(clickedNumberDay)).update({
             time: `${newTime}`,
             eventText: `${newTextEv}`
           });

          clear();
          findEventInMonth();
        });
      };

      findEventInMonth();
})();
