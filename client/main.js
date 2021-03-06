import { Meteor } from 'meteor/meteor'
import { Template } from 'meteor/templating'
import { Session } from 'meteor/session'

import './main.html';

import './templates/settings.html'
import './templates/settings.js'
import './templates/changepass.html'
import './templates/changepass.js'
import './uploadacademicrecord.html'
import './uploadacademicrecord.js'
import './uploadcurricularstructure.html'
import './uploadcurricularstructure.js'
import './exporter.html'
import './exporter.js'
import './exportercurricular.js'
import './search.html'
import './search.js'
import './queries.js'
import {DefaultRootUser} from "../imports/utils/defaultrootuser"
import {userHasCompletedTasks} from "../imports/utils/functions/userHasCompletedTasks";


Meteor.subscribe('record');
Meteor.subscribe('userStats');
Meteor.subscribe('curricularStructure');
Meteor.subscribe('disciplines');

Router.configure({
  layoutTemplate: 'main',
  loadingTemplate: 'loading'
});

Router.route('/', {
  name: 'home',
  template: 'home',
  onBeforeAction() {
    if (Meteor.userId()) {
      this.next();
    } else {
      this.render("login");
    }
  }
});


Router.route('/login');


Router.route('/uploadcurricularstructure', {
  onBeforeAction() {
    if (Meteor.userId()) {
      this.next();
    } else {
      this.render("login");
    }
  }
});

Router.route('/search', {
  /*onBeforeAction() {
    if (Meteor.userId()) {
      this.next();
    } else {
      this.render("login");
    }
  }*/
});

Router.route('/disciplinesSearchs',{});
Router.route('/studentsSearchs',{});
Router.route('/uploadacademicrecord', {
  onBeforeAction() {
    if (Meteor.userId()) {
      this.next();
    } else {
      this.render("login");
    }
  }
});

Router.route('/settings', {
  name: 'settings',
  template: 'settings',
  onBeforeAction() {
    if (Meteor.userId()) {
      this.next();
    } else {
      this.render("login");
    }
  }
});




Template.menuItems.events({
  'click .logout': function (event) {
    event.preventDefault();
    Meteor.logout();
    Router.go('login');
  }
});


Template.login.onCreated(() => {
  Template.instance().validEmail = new ReactiveVar(true);
  Template.instance().validPassword = new ReactiveVar(true);
});

Template.login.helpers({
    validEmail() {
      return Template.instance().validEmail.get();
    },
    validPassword() {
      return Template.instance().validPassword.get();
    },
  });


Template.login.events({
  'submit form': function (event) {
    event.preventDefault();
  }
});


$.validator.setDefaults({
  rules: {
    email: {
      required: true,
      email: true
    },
    password: {
      required: true,
      minlength: 3
    }
  },
  messages: {
    email: {
      required: "Você deve digitar um email.",
      email: "Você digitou email inválido."
    },
    password: {
      required: "Você deve inserir uma Senha.",
      minlength: "Sua senha deve ter pelo menos {0} caracteres."
    }
  }
});

Template.login.onRendered(function () {

  var validator = $('.login').validate({

    onkeyup: false,
    keypress: false,

    errorPlacement: function (error, element) {
            Bert.alert(error.text(),'danger' );
    },

    submitHandler: function (event) {
      var email = $('[name=email]').val();
      var password = $('[name=password]').val();
      Meteor.loginWithPassword(email, password, function (error) {
        if (error) {
          if (error.reason === "User not found") {
            Bert.alert( 'Usuário não cadastrado', 'danger' );
          }
          if (error.reason === "Incorrect password") {
            Bert.alert( 'Senha incorreta', 'danger' );
          }
        } else {
          Meteor.call('isFirstLogin', (error, results) => {
            if (results) {
              Bert.alert('Altere sua senha no primeiro login!',
                'warning', 'growl-top-right', 'fa-warning');
              Router.go("changepass");
            } else {
              Router.go("home");
            }
          });
        }
      });
    }
  });

});


Template.home.onRendered(function(){

  if (Meteor.user()) {

    const currentUserId = Meteor.userId();
    const user = Users.findOne({ idUser: currentUserId });

    Bert.defaults.hideDelay = user ? user.durationAlerts : DefaultRootUser.durationAlerts;

    const tipUploadCurricularStructure = 'Você possui tarefas pendentes. Veja abaixo a lista de' +
      ' configurações!';

    Meteor.call('isFirstLogin', (error, results) => {
      if (!results) {
        if (!user || !user.changedDefaultPassword ||
          !user.uploadedCurricularStructure || !user.uploadedAcademicRecords)
          Bert.alert(tipUploadCurricularStructure, 'info', 'growl-top-right');
      }
    });
  }

});


Template.home.helpers({

  userName: function () {
    const currentUser = Meteor.userId();
    const usr = Users.findOne({ idUser: currentUser });
    return usr ? usr.name : "No name";
  },

  userCourse: function () {
    const currentUser = Meteor.userId();
    const usr = Users.findOne({ idUser: currentUser });
    return usr ? usr.course : "No course";
  },

  userCurrentYear: function () {
    const currentUser = Meteor.userId();
    const usr = Users.findOne({ idUser: currentUser });
    return usr ? usr.currentYear : "No data";
  },

  userCurrentSemester: function () {
    const currentUser = Meteor.userId();
    const usr = Users.findOne({ idUser: currentUser });
    return usr ? usr.currentSemester : "No course";
  },

  doneTasks: function () {
    return userHasCompletedTasks();
  }

});


/*Meteor.logout(function(err){
  if (err)
    console.log(err);
});*/
function loadingAutoComplete(){
  if (Meteor.isClient) {


        if(Template.instance().isStudent.get()){
          $('#autocomplete-input').autocomplete({
            lookup: function (query, done) {
                  var result = {
                      suggestions: listOfStudents()
                  };
                  done(result);
            }

          });
        }else{
            $('#autocomplete-input').autocomplete({
              lookup: function (query, done) {
                    var result = {
                        suggestions: Disciplines.find().map(function(x) {
                           return { value: x.nome, data: x.codigo};
                        })
                    };
                    done(result);
              }

            });
        }

  }
}
Template.searchbox.onRendered(function(){
  loadingAutoComplete();
});

Template.disciplinesSearchs.onCreated(() => {

  Template.instance().countStudentsWhoMustEnrollInACourse         = new ReactiveVar(0);
  Template.instance().countStudentsWhoHavePrerequisitesForACourse = new ReactiveVar(0);
  Template.instance().countStudentsAtCourseSemester = new ReactiveVar(0);
});

Template.searchbox.onCreated(() => {
  //Template.instance().courseName = new ReactiveVar('');
  Template.instance().isStudent  = new ReactiveVar(true);
  Template.instance().semesterdisciplinesuggested = new ReactiveVar(0);
});

Template.searchbox.events({
  'submit form': function (event) {
    const name = $('[name=search]').val();
    //Template.instance().courseName.set(name);
    Session.set('courseName', name);
    event.preventDefault();
    var radioValue = event.target.group1.value;
    if (radioValue == 'a'){

      Session.set('showRegister',true);
    }else if(radioValue == 'd'){

      Session.set('showRegister',false);
    }

    console.log(Session.get('courseName'));
    console.log(Disciplines.find().map(function(x) {
       return { value: x.nome, data: x.codigo};
    }));

  },
  'click .a': function(){
      Template.instance().isStudent.set(true);
      Session.set('showRegister',true);
      loadingAutoComplete();
  },
  'click .d': function(){
      Template.instance().isStudent.set(false);
      Session.set('showRegister',false);      
      loadingAutoComplete();
  }

});

Session.set('showRegister', true);
Session.set('courseName', '');

Template.searchbox.helpers({
  showStudents :function(){
      return Session.get('showRegister');
  },
  // courseName :function(){
  //   return Template.instance().courseName.get();
  // }
});
///////////////////////////Não é possivel acessar essas funções pelo helper do studentsSearchs////////////////////
function getAtualSem(){
  const dataUser = Users.findOne({idUser:Meteor.userId()});
  if(dataUser==null){
    //console.log("erro ao obter id da conexao");
    return null;
  }
  const year=dataUser.currentYear;
  const sem=dataUser.currentSemester;
  //console.log("Semestre atual"+year+"/"+sem);
  var key= {"year":year,"semester":sem};
  return key ;
}
function calcCourseSemesterByStudent(rga){
  let key_rga =Math.floor(parseInt(rga)/Math.pow(10,7));
  let sYear = Math.floor(key_rga/10);//pega o ano do rga do estudante
  let sSemester = parseInt((key_rga%10));
  let key_atual = getAtualSem();
  let cYear = parseInt(key_atual.year);
  let cSemester = parseInt(key_atual.semester);
  let sem=1;
  while((sYear!=cYear || sSemester!=cSemester)&&sem<=10){
      sem = sem+1;
      if(sSemester==2){
        sYear=sYear+1;
        sSemester =1;
      }
      else sSemester =2;
  }
  return sem;
}
///////////////////////////Não é possivel acessar essas funções pelo helper do studentsSearchs////////////////////
Template.studentsSearchs.helpers({

disciplinesSettings: function () {
    return {
        rowsPerPage: 10,
        showFilter: true,
        fields: [
          { key: 'codigo', label: 'Código' , cellClass: 'col-md-4'},
          { key: 'nome', label: 'Nome' , cellClass: 'col-md-4'}
        ]
    };
},
  coursesAtStudentSemester:function(){
      let studentKey = Session.get('courseName');//devera ser alterado
      let cod = parseInt(studentKey,10);
      let student=Records.findOne({rga:cod});
      if(student==null){
        studentNome = Session.get('courseName');//devera ser alterado
        student=Records.findOne({nome:studentNome});
      }
      if(student==null)
        return [{}];

      let studentSem=parseInt(calcCourseSemesterByStudent(student.rga),10);
      if(studentSem<2||studentSem>10)
        return [{}];

      let discipline = CurricularStructure.find({createdBy:Meteor.userId(),semestre:studentSem});
      if(discipline ==null)
        return[{}];

      let map={};
      let disc;
      discipline.forEach(item=>{
         disc = Disciplines.findOne({_id:item.idDisciplina},{fields:{nome:1 , codigo:1}});
         if(!map[disc.codigo]){
           map[disc.codigo]={
               codigo: disc.codigo,
               nome:disc.nome
           }
         }

      });
    let v =[{}];
    v = hash2array(map);
  return v;
}
});

Template.disciplinesSearchs.helpers({
  isStudent: function() {
    return Template.instance().isStudent.get();
  },
  settings: function () {
      return {
          rowsPerPage: 10,
          showFilter: true,
          fields: [
            { key: 'rga', label: 'RGA' , cellClass: 'col-md-4'},
            { key: 'nome', label: 'Nome' , cellClass: 'col-md-4'}
          ]
      };
  },
disciplinesSettings: function () {
    return {
        rowsPerPage: 10,
        showFilter: true,
        fields: [
          { key: 'codigo', label: 'Código' , cellClass: 'col-md-4'},
          { key: 'nome', label: 'Nome' , cellClass: 'col-md-4'}
        ]
    };
},

  studentsAtCourseSemester: function(){
      let courseName = Session.get('courseName');
      let semesterCourse;
      let courseId;
      Template.instance().countStudentsAtCourseSemester.set(0);
      if(courseName == '')
        return [{}];

      courseId = Disciplines.findOne({nome: courseName}, {fields:{_id:1}});
      courseId = courseId==null?'':courseId._id;
     if(courseId!=''){
        semesterCourse=CurricularStructure.findOne({idDisciplina: courseId},{fields:{semestre:1}});
        //Template.instance().semesterSearch.set(semesterCourse.semestre);
        //Template.search.__helpers.get('searchStudentBySemester').call();
        console.log(semesterCourse.semestre);
        let res;
        if(semesterCourse.semestre>1){
          res = searchStudentBySemesterForHelper(semesterCourse.semestre);
          Template.instance().countStudentsAtCourseSemester.set(res.length);
          return res;

        }else return [{}]
     }
     else{
          //console.log("Disciplina nao encontrada");
          return [{}];
     }

  },
  coursesAtStudentSemester:function(){
      let studentKey = Session.get('courseName');//devera ser alterado
      let cod = parseInt(studentKey,10);
      let student=Records.findOne({rga:cod});
      if(student==null)
          return [{}];

      let studentSem=parseInt(calcCourseSemesterByStudent(student.rga),10);
      if(studentSem<2||studentSem>10)
        return [{}];

      let discipline = CurricularStructure.find({createdBy:Meteor.userId(),semestre:studentSem});
      if(discipline ==null)
        return[{}];

      let map={};
      let disc;
      discipline.forEach(item=>{
         disc = Disciplines.findOne({_id:item.idDisciplina},{fields:{nome:1 , codigo:1}});
         if(!map[disc.codigo]){
           map[disc.codigo]={
               codigo: disc.codigo,
               nome:disc.nome
           }
         }

      });
    let v =[{}];
    v = hash2array(map);
  return v;
},

  studentsWhoHavePrerequisitesForACourse: function(){
    let courseName = Session.get('courseName');
    if(courseName != '') {
      let candidates = auxStudentsWhoMustEnrollInACourse(courseName);
      //console.log(courseName)
      courseId = Disciplines.findOne({nome: courseName}, {fields:{_id:1}});
      courseId = courseId==null?'':courseId._id;
      //console.log(courseId);
      let prereq = CurricularStructure.findOne({idDisciplina: courseId}, {fields: {prereq: 1}});
      prereq = prereq == null?[]:prereq.prereq;
    var map = {};
    console.log(prereq)
    candidates.forEach(function(student) {
      let count = 0;
      prereq.forEach(function(code) {

        courseName = Disciplines.findOne({_id: code}, {fields: {nome: 1}}).nome;
        let exist = Records.findOne({rga: student.rga, disciplina: courseName, situacao: "AP"}, {_id: 0});
        if(exist)
          count = count + 1;
      });

      if(count == prereq.length) {

        map[student.rga] = {
           nome: student.nome,
           rga: student.rga
       }
      }
    });
      let result = hash2array(map);
      Template.instance().countStudentsWhoHavePrerequisitesForACourse.set(result.length);
      return result;
    }
    else { Template.instance().countStudentsWhoHavePrerequisitesForACourse.set(0);return [{}]};
  },

  studentsWhoMustEnrollInACourse: function(){

      let courseName = Session.get('courseName');
      if(courseName == '') {
        Template.instance().countStudentsWhoMustEnrollInACourse.set(0);
        return [{}];
      }
      let result = auxStudentsWhoMustEnrollInACourse(courseName);
      Template.instance().countStudentsWhoMustEnrollInACourse.set(result.length);
      return result;
  },
  countStudentsWhoMustEnrollInACourse: function() {

    Template.disciplinesSearchs.__helpers.get('studentsWhoMustEnrollInACourse').call();
    return Template.instance().countStudentsWhoMustEnrollInACourse.get();
  },
  countStudentsWhoHavePrerequisitesForACourse: function() {
    Template.disciplinesSearchs.__helpers.get('studentsWhoHavePrerequisitesForACourse').call();
    return Template.instance().countStudentsWhoHavePrerequisitesForACourse.get();
  },
  countStudentsAtCourseSemester:function(){
      Template.disciplinesSearchs.__helpers.get('studentsAtCourseSemester').call();
      return Template.instance().countStudentsAtCourseSemester.get();
  }

});

Template.disciplinesSearchs.onRendered(function(){
  accordion();
});
Template.studentsSearchs.onRendered(function(){
  accordion();
});
function accordion(){
    if (Meteor.isClient) {
    (function(){
    	var d = document,
    	accordionToggles = d.querySelectorAll('.js-accordionTrigger'),
    	setAria,
    	setAccordionAria,
    	switchAccordion,
      touchSupported = ('ontouchstart' in window),
      pointerSupported = ('pointerdown' in window);

      skipClickDelay = function(e){
        e.preventDefault();
        e.target.click();
      }

    		setAriaAttr = function(el, ariaType, newProperty){
    		el.setAttribute(ariaType, newProperty);
    	};
    	setAccordionAria = function(el1, el2, expanded){
    		switch(expanded) {
          case "true":
          	setAriaAttr(el1, 'aria-expanded', 'true');
          	setAriaAttr(el2, 'aria-hidden', 'false');
          	break;
          case "false":
          	setAriaAttr(el1, 'aria-expanded', 'false');
          	setAriaAttr(el2, 'aria-hidden', 'true');
          	break;
          default:
    				break;
    		}
    	};
    //function
    switchAccordion = function(e) {
      console.log("triggered");
    	e.preventDefault();
    	var thisAnswer = e.target.parentNode.nextElementSibling;
    	var thisQuestion = e.target;
    	if(thisAnswer.classList.contains('is-collapsed')) {
    		setAccordionAria(thisQuestion, thisAnswer, 'true');
    	} else {
    		setAccordionAria(thisQuestion, thisAnswer, 'false');
    	}
      	thisQuestion.classList.toggle('is-collapsed');
      	thisQuestion.classList.toggle('is-expanded');
    		thisAnswer.classList.toggle('is-collapsed');
    		thisAnswer.classList.toggle('is-expanded');

      	thisAnswer.classList.toggle('animateIn');
    	};
    	for (var i=0,len=accordionToggles.length; i<len; i++) {
    		if(touchSupported) {
          accordionToggles[i].addEventListener('touchstart', skipClickDelay, false);
        }
        if(pointerSupported){
          accordionToggles[i].addEventListener('pointerdown', skipClickDelay, false);
        }
        accordionToggles[i].addEventListener('click', switchAccordion, false);
      }
    })();
    }
}
