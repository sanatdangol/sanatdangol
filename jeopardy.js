// categories is the main data structure for the app; it looks like this:

//  [
//    { title: "Math",
//      clues: [
//        {question: "2+2", answer: 4, showing: null},
//        {question: "1+1", answer: 2, showing: null}
//        ...
//      ],
//    },
//    { title: "Literature",
//      clues: [
//        {question: "Hamlet Author", answer: "Shakespeare", showing: null},
//        {question: "Bell Jar Author", answer: "Plath", showing: null},
//        ...
//      ],
//    },
//    ...
//  ]
const BASE_API_URL = "https://rithm-jeopardy.herokuapp.com/api/";
const NUM_CATEGORIES = 6;
const NUM_CLUES_PER_CAT = 5;
/** Get NUM_CATEGORIES random category from API.
 *
 * Returns array of category ids
 */
let categories = [];

async function getCategoryIds() {
  
//   const res= await axios.get(`https://rithm-jeopardy.herokuapp.com/api/categories?count=100`);
//   const categories =res.data;
//   const catIds= categories.map(function(category){
//       return {
//           id: category.id,
//           // title: category.title
//        };       
//   });
//   return _.sampleSize(catIds, NUM_CATEGORIES) ;
// }
// ask for 100 categories [most we can ask for], so we can pick random
let response = await axios.get(`${BASE_API_URL}categories`, {
  params: { count: 100 }
});
let catIds = response.data.map(c => c.id);
return _.sampleSize(catIds, NUM_CATEGORIES);
}



/** Return object with data about a category:
 *
 *  Returns { title: "Math", clues: clue-array }
 *
 * Where clue-array is:
 *   [
 *      {question: "Hamlet Author", answer: "Shakespeare", showing: null},
 *      {question: "Bell Jar Author", answer: "Plath", showing: null},
 *      ...
 *   ]
 */
// const catId = 9;

async function getCategory(catId) {
  let response = await axios.get(`${BASE_API_URL}category`, {
    params: { id: catId }
  });
  let cat = response.data;
  let randomClues = _.sampleSize(cat.clues, NUM_CLUES_PER_CAT).map(c => ({
    question: c.question,
    answer: c.answer,
    showing: null
  }));
  return { title: cat.title, clues: randomClues };
}

/** Fill the HTML table#jeopardy with the categories & cells for questions.
 *
 * - The <thead> should be filled w/a <tr>, and a <td> for each category
 * - The <tbody> should be filled w/NUM_QUESTIONS_PER_CAT <tr>s,
 *   each with a question for each category in a <td>
 *   (initally, just show a "?" where the question/answer would go.)
 */


async function fillTable() {
  hideLoadingView();

  // Add row with headers for categories
  let $tr = $("<tr>");
  for (let category of categories) {
    $tr.append($("<th>").text(category.title));
  }
  $("#jeopardy thead").append($tr);

  // Add rows with questions for each category
  $("#jeopardy tbody").empty();
  for (let clueIdx = 0; clueIdx < NUM_CLUES_PER_CAT; clueIdx++) {
    let $tr = $("<tr>");
    for (let catIdx = 0; catIdx < NUM_CATEGORIES; catIdx++) {
      $tr.append(
        $("<td>")
          .attr("id", `${catIdx}-${clueIdx}`)
          .append($("<div>?</div>").addClass("question-mark"))
      );
    }
    $("#jeopardy tbody").append($tr);
  }
}

/** Handle clicking on a clue: show the question or answer.
 *
 * Uses .showing property on clue to determine what to show:
 * - if currently null, show question & set .showing to "question"
 * - if currently "question", show answer & set .showing to "answer"
 * - if currently "answer", ignore click
 * */

function handleClick(evt) {
  //   var button = document.getElementById('startButton');
  //   var loadingSpinner = document.getElementById('loadingSpinner');
  // // Hide the button and show the loading spinner
  //    button.style.display = 'none';
  //   loadingSpinner.style.display = 'block';
  // // Simulate some time-consuming task
  // setTimeout(function() {
  //   // Show the button and hide the loading spinner after 2 seconds
  //   loadingSpinner.style.display = 'none';
  // }, 2000); // 2 seconds
  
  let $tgt = $(evt.target);
  let id = $tgt.attr("id");
  let [catId, clueId] = id.split("-");
  let clue = categories[catId].clues[clueId];

  let msg;

  if (!clue.showing) {
    msg = clue.question;
    clue.showing = "question";
  } else if (clue.showing === "question") {
    msg = clue.answer;
    clue.showing = "answer";
    $tgt.addClass("disabled");
  } else {
    // already showing answer; ignore
    return;
  }

  // Update text of cell
  $tgt.html(msg);
}

/** Wipe the current Jeopardy board, show the loading spinner,
 * and update the button used to fetch data.
 */

function showLoadingView() {
  $("#jeopardy thead").empty();
  $("#jeopardy tbody").empty();

  // show the loading icon
  $("#spin-container").show();
  $("#starts")
    .addClass("disabled")
    .text("LOADING");
}

/** Remove the loading spinner and update the button used to fetch data. */

function hideLoadingView() {
  $("#starts")
    .removeClass("disabled")
    .text("RESTART");
  $("#spin-container").hide();
}

/** Start game:
 *
 * - get random category Ids
 * - get data for each category
 * - create HTML table
 * */

async function setupAndStart() {
  let isLoading = $("#starts").text() === "LOADING";

  if (!isLoading) {
    showLoadingView();

    let catIds = await getCategoryIds();

    categories = [];

    for (let catId of catIds) {
      categories.push(await getCategory(catId));
    }

    fillTable();
  }
}



/** On click of start / restart button, set up game. */

// TODO

/** On page load, add event handler for clicking clues */
$("#start").on("click", setupAndStart);
// TODO

$(async function() {
  $("#jeopardy").on("click", "td", handleClick);
});



