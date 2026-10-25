
migrate((app) => {
  const payments = app.findCollectionByNameOrId("payments");
  const invoices = app.findCollectionByNameOrId("invoices");

  const existingField = payments.fields.find(
    (field) => field.name === "invoice"
  );

  if (!existingField) {
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
  }
}, (app) => {
  // Tidak menghapus field saat rollback agar relasi dan data
  // yang sudah digunakan tidak terhapus secara tidak sengaja.
});
