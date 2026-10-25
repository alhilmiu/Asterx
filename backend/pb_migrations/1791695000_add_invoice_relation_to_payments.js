
migrate((app) => {
  const payments = app.findCollectionByNameOrId("payments");
  const invoices = app.findCollectionByNameOrId("invoices");

  // Hindari menambahkan field dua kali.
  const existingField = payments.fields.find(
    (field) => field.name === "invoice"
  );

  if (existingField) {
    return;
  }

  payments.fields.add(
    new RelationField({
      name: "invoice",
      required: false,
      collectionId: invoices.id,
      maxSelect: 1,
      cascadeDelete: false,
    })
  );

  app.save(payments);
}, (app) => {
  const payments = app.findCollectionByNameOrId("payments");

  if (payments) {
    payments.fields.removeByName("invoice");
    app.save(payments);
  }
});
