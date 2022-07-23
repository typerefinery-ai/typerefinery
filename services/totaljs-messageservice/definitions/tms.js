NEWPUBLISH("connections_insert", "Connections")
NEWPUBLISH("connections_update", "Connections")
NEWPUBLISH("connections_remove", "Connections")

// NEWPUBLISH('products_insert', 'Products');
// NEWPUBLISH('products_update', 'Products');
// NEWPUBLISH('products_remove', 'Products');

NEWSUBSCRIBE("connections_insert", "Connections")
NEWSUBSCRIBE("connections_update", "Connections")
NEWSUBSCRIBE("connections_remove", "Connections")

// NEWSUBSCRIBE('products_insert', 'Products');
// NEWSUBSCRIBE('products_update', 'Products');
// NEWSUBSCRIBE('products_remove', 'Products');

SUBSCRIBE("connections_insert", function (model) {
  EXEC("+Connections --> insert", model, NOOP)
})

SUBSCRIBE("connections_update", function (model) {
  var controller = EXEC("+Connections --> update", model, NOOP)

  // Set $.id param to EXEC call - https://docs.totaljs.com/total4/407ff001jy51c/#485dc001cl51c
  controller.id = model.id
})

SUBSCRIBE("connections_remove", function (model) {
  var controller = EXEC("+Connections --> remove", null, NOOP)

  // Set $.id param to EXEC call - https://docs.totaljs.com/total4/407ff001jy51c/#485dc001cl51c
  controller.id = model.id
})
