import {Template} from 'meteor/templating';

import './taskslist.html'


Meteor.subscribe('userStats');


Template.taskslist.helpers({
  task: function() {
    const currentUserId = Meteor.userId();
    const user = Users.findOne({ idUser: currentUserId });
    let tasks = [{}];

    if(currentUserId && user) {

      tasks = [
        {
            number: '1',
            name: "Alterar senha padrão",
            link: "changepass",
            status:  Users.findOne({ idUser: currentUserId }).changedDefaultPassword
        },
        {
          number: '2',
          name:'Fazer upload da matriz (estrutura) curricular de disciplinas',
          link: 'uploadcurricularstructure',
          status: Users.findOne({ idUser: currentUserId }).uploadedCurricularStructure
        },
        {
          number: '3',
          name: ' Fazer upload do histórico acadêmico dos alunos',
          link: 'uploadacademicrecord',
          status: Users.findOne({ idUser: currentUserId }).uploadedAcademicRecords
        }
      ];
    }
    return tasks;
  },

  done: function () {
    const currentUserId = Meteor.userId();
    const user = Users.findOne({ idUser: currentUserId });
    return user && user.changedDefaultPassword &&
      user.uploadedCurricularStructure && user.uploadedAcademicRecords;
  }


});
