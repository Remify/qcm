/**
 * Created by Remi on 24/01/2017.
 */
var socket = io.connect('http://localhost:3000');
var charts = [];

$(document).ready(function () {
    // nom de la room
    var roomName = $('#dataRoom').data('roomName');
    // Ensemble des requêtes reçu par la room
    var submissions = []
    // Connection à la room
    socket.emit("roomConnect", {room: roomName, name: 'admin'});

    // Abonnement aux nouveaux résultats
    socket.on("newSubmission", function (entry) {

        var userSubmissions = []
        userSubmissions = submissions.filter(function (submission) {
            return submission.user == entry.user && submission.questionId == entry.questionId
        });

        console.log('sub');
        console.log(userSubmissions);
        if(userSubmissions.length > 0) {
            var lastSubmission = userSubmissions[userSubmissions.length -1];
            console.log(lastSubmission)
            updateData(lastSubmission.questionId, lastSubmission.responseId, -1);
            updateData(entry.questionId, entry.responseId, +1);
        } else {
            updateData(entry.questionId, entry.responseId, +1);
        }
        submissions.push(entry);
    });

    //Si on a cliqué sur Réponse juste
    socket.on('reponseJuste', function (result) {
        console.log(charts[result[0].qId].data.datasets);

        var question = $('#question-' + result[0].qId).find('.json').data('json');

        // Tableau de conversion idReponse => index Chart
        var arrRef = [];

        // Construction du tableau de conversion
        for(var i=0; i < question.reponses.length; i++ ) {
            arrRef[question.reponses[i].id] = i;
        }

        //On colorie la (les) bonnes réponses en vert
        console.log();
        var i;
        for(i=0; i<result.length;i++){
            if(charts[result[i].qId].data.datasets[0].data[arrRef[result[i].rId]] == 0){
                charts[result[i].qId].data.datasets[0].data[arrRef[result[i].rId]] = 1;
            }
            charts[result[i].qId].data.datasets[0].backgroundColor[arrRef[result[i].rId]] = '#00ff00';
            charts[result[i].qId].update();
        }
    });



    var updateData = function (idQuestion, idReponse, operator) {

        var question = $('#question-' + idQuestion).find('.json').data('json');

        // Tableau de conversion idReponse => index Chart
        var arrRef = [];

        // Construction du tablaeu de conversion
        for(var i=0; i < question.reponses.length; i++ ) {
            arrRef[question.reponses[i].id] = i;
        }

        var idValue = arrRef[idReponse];
        if(operator < 0) {
            charts[idQuestion].data.datasets[0].data[idValue]--;
        } else {
            charts[idQuestion].data.datasets[0].data[idValue]++;
        }
        charts[idQuestion].update();
    };


    $('.charts').each(function (index, chart) {

        var question = $('#question-' + chart.dataset.questionId).find('.json').data('json');

        var dataReponses = [];
        for(var i = 0; i < question.reponses.length; i++) {
            dataReponses[i] = 0 ;
        }


        var data = {

            // Labels
            labels: question.reponses.map(function (reponse) {
                return reponse.intitule
            }),

            datasets: [
                {
                    data: dataReponses,
                    backgroundColor: [
                        "#FF6384",
                        "#36A2EB",
                        "#FFCE56"
                    ],
                    hoverBackgroundColor: [
                        "#FF6384",
                        "#36A2EB",
                        "#FFCE56"
                    ]
                }]
        }

        var myPieChart = new Chart($(this), {
            type: 'pie',
            data: data
        });

        charts[$(this).data('questionId')] = myPieChart ;
    });

});