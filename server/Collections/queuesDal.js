Meteor.publish("Queues", function (branchId) {
  if(this.userId) { 
    return Queues.find({branchId:branchId});
  }
});



Queues.allow({
  insert: function (userId, doc) {
    return GetAllowBranches(userId,doc.branchId,['Admin','Manager']) ;
  },
  update: function (userId, doc, fieldNames, modifier){
    return GetAllowBranches(userId,doc.branchId,['Admin','Manager']) ;
  },
  remove: function(userId, doc){
    return GetAllowBranches(userId,doc.branchId,['Admin','Manager']) ;
  },
});



Queues.before.insert(function (userId, doc) {
  doc.creationTime = Date.now();
  doc.last = 0;
  doc.currentSeq = 0;
 // doc.openTickets = 0;
  doc.additionalDetails = [];
});

Meteor.methods({
  boNextTicket:function(queueId){
    var queue = Queues.findAndModify({
      query: { _id: queueId },
      update: { $inc: { currentSeq: 1}},
      new: true
    }); 
    var ticket = Tickets.findOne({queueId:queueId,sequence:queue.currentSeq,status:'Waiting'});
    while(!ticket && queue.currentSeq <= queue.last){
      queue = Queues.findAndModify({
          query: { _id: queueId },
          update: { $inc: { currentSeq: 1}},
          new: true
      }); 
      ticket = Tickets.findOne({queueId:queueId,sequence:queue.currentSeq,status:'Waiting'});
    }
    if (!ticket) {
      return;
    }
    return boChangeTicketStatus(ticket,"Getting Service",this.userId,'');
  },

});
