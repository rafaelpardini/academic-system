Template.dataremove.events({
  'click .btn-delete': function (event, template) {
    if (!window.confirm("Você tem certeza? Esta operação não pode ser desfeita."))
      return;

    Meteor.call(this.method, (error, results) => {
      if (results) {
        Bert.alert(this.method + ': Troca a msg', 'success', 'growl-top-right');
        Meteor.call(this.changeflagmethod);
        Meteor.call('changeCurrentSemester', 1);
      } else {
        Bert.alert('Já está vazio.', 'warning', 'growl-top-right' );
      }
    });
  },
});
