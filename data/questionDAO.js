/**
 * Created by bouguerr on 08/02/2017.
 */
var connection = require('./database');
var Question = require('./question');


var QuestionDAO = {
    execute: function (query, callback) {

        connection.query(query, function (error, results, fields) {
            if (error) throw error;
            callback(results, fields);
        });


    },
    retrieveById: function(id, callback) {

            var query = "SELECT question.id as qId, question.intitule as qIntitule, reponse.id as rId, reponse.intitule as rIntitule, question.id_niveau, question.id_matiere, reponse.isTrue FROM question LEFT JOIN reponse ON question.id = reponse.question_id  AND 	question.id = " + id;
            this.execute(query, function (results, fields) {

                if(results[0]) {
                    var q = new Question(results[0].qId, results[0].qIntitule);
                    q.id_niveau = results[0].id_niveau;
                    q.id_matiere = results[0].id_matiere;
                    results.forEach(function (result) {
                        var reponse = {
                            id: result.rId,
                            intitule: result.rIntitule,
                            isTrue : result.isTrue
                        };
                        q.reponses.push(reponse);
                    })
                }
                callback(q);
            })
    },

    retrieveByRoomId: function(id, callback) {
        var query = "SELECT question.id, intitule FROM question, room_questions WHERE question.id = room_questions.question_id AND room_questions.room_id = " + id + " ORDER BY qOrder";
        this.execute(query, function (results) {
            callback(results);
        });
    },

    retrieveByQuestionUId: function (uID, callback) {
        var query = "SELECT question.id as qId, question.intitule as qIntitule, reponse.id as rId, reponse.intitule as rIntitule FROM question, reponse WHERE question.id = reponse.question_id AND question.id in (SELECT question_id FROM room_questions WHERE room_questions.id = " + uID + ")";

        this.execute(query, function (results) {

            if(results[0]) {
                var q = new Question(uID, results[0].qIntitule);
                results.forEach(function (result) {
                    var reponse = {
                        id: result.rId,
                        intitule: result.rIntitule
                    };
                    q.reponses.push(reponse);
                })
            }
            callback(q);

        });
    },
    
    retrieveAllByRoomId: function (id, callback) {
        var query = "SELECT reponse.id, reponse.intitule, question.id as qId, question.intitule as qIntitule, room_questions.id as qUID FROM reponse, question, room_questions WHERE question.id = reponse.question_id AND reponse.question_id = room_questions.question_id AND room_questions.room_id = " + id ;


        this.execute(query, function (results, fields) {
            callback(results);
        });
    },
    
    getAllQuestions: function (callback) {
        var query = 'SELECT question.id, question.intitule, niveau.intitule as nIntitule, matiere.intitule as mIntitule FROM question LEFT JOIN niveau ON question.id_niveau = niveau.id LEFT JOIN matiere ON question.id_matiere = matiere.id'
        this.execute(query, function (results) {

            callback(results);
        })
    },

    /**
     * Enregistre une nouvelle question. Retourne l'id de la question créée
     * Retourne
     * @param qIntitule
     * @param callback
     */
    newQuestion : function (qIntitule, id_niveau, id_matiere, callback) {
        var question = { id: null, intitule: qIntitule, id_niveau: id_niveau, id_matiere: id_matiere };
        var query = connection.query('INSERT INTO question SET ?', question, function (error, results, fields) {
            if (error) throw error;
            callback(results.insertId);
        });
    },

    /**
     * Supprime la question dont l'id est passé en paramètre
     * @param id
     * @param callback
     */
    deleteQuestion : function (id, callback) {
        var query = connection.query('DELETE FROM question WHERE id=?', id, function (error, results, fields) {
            if (error) throw error;
            callback(results.insertId);
        });

    },

    /**
     * Modifie l'intitulé d'une question existante dont l'id est passé en paramètre
     * @param id
     * @param qIntitule
     * @param callback
     */
    editQuestion : function (id, qIntitule, id_niveau, id_matiere, callback) {
        qIntitule = qIntitule.replace(/(['"])/g, "\\$1");
        var query = connection.query("REPLACE INTO question(id, intitule, id_niveau, id_matiere) VALUES(" + id + ",'" + qIntitule + "'," + id_niveau + "," + id_matiere + ")" , function (error, results, fields) {

            if (error) throw error;
            callback(results.insertId);
        });
    },

    newReponse : function (rIntitule, qId, istrue, callback) {

        var reponse = { id: null, intitule: rIntitule, question_id: qId, isTrue: istrue };
        var query = connection.query('INSERT INTO reponse SET ?', reponse, function (error, results, fields) {

            if (error) throw error;
        });
    }, 

    deleteReponse: function(rId, callback){
        var query = "DELETE FROM reponse WHERE id = " +rId ;
        this.execute(query, function (results) {
            callback(results);
        })
    },

    editReponse: function (id, rIntitule, isTrue, Qid, callback) {
        rIntitule = rIntitule.replace(/(['"])/g, "\\$1");
        var query = connection.query("REPLACE INTO reponse (id, intitule, isTrue, question_id ) VALUES(" + id + ",'" + rIntitule + "'," + isTrue + ", " + Qid + ")" , function (error, results, fields) {

            if (error) throw error;
            callback(results.insertId);
        });
    },

    getReponseByQuestionId: function (id, callback) {
        var query = "SELECT * FROM reponse WHERE question_id =" +id;
        this.execute(query, function (results) {
            callback(results);
        })
    },

    getReponseJuste: function (Qid, callback) {
        var query = "SELECT reponse.id as rId, room_questions.id as qId FROM reponse JOIN room_questions USING (question_id) WHERE (room_questions.id =" +Qid+" and reponse.isTrue = 1)";
        this.execute(query, function (results) {
            callback(results);
        })
    }
}


module.exports = QuestionDAO;