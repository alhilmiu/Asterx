
migrate((app) => {
  // Mengikuti aturan akses koleksi clients yang sudah ada.
  const clients = app.findCollectionByNameOrId("clients");

  const vendors = new Collection({
    name: "vendors",
    type: "base",

    fields: [
      {
        name: "vendor_name",
        type: "text",
        required: true,
        min: 1,
        max: 200,
      },
      {
        name: "company_name",
        type: "text",
        max: 200,
      },
      {
        name: "phone",
        type: "text",
        max: 50,
      },
      {
        name: "email",
        type: "email",
      },
      {
        name: "address",
        type: "text",
        max: 2000,
      },
      {
        name: "category",
        type: "select",
        required: true,
        maxSelect: 1,
        values: [
          "design",
          "printing",
          "photography",
          "video",
          "catering",
          "venue",
          "decoration",
          "digital_service",
          "equipment",
          "other",
        ],
      },
      {
        name: "status",
        type: "select",
        required: true,
        maxSelect: 1,
        values: ["active", "inactive"],
      },
      {
        name: "payment_terms",
        type: "text",
        max: 500,
      },
      {
        name: "notes",
        type: "text",
        max: 5000,
      },
    ],

    indexes: [],

    // Mengikuti API Rules dari koleksi clients.
    listRule: clients.listRule,
    viewRule: clients.viewRule,
    createRule: clients.createRule,
    updateRule: clients.updateRule,
    deleteRule: clients.deleteRule,
  });

  app.save(vendors);
}, (app) => {
  // Rollback: hapus koleksi vendors jika migration dibatalkan.
  const vendors = app.findCollectionByNameOrId("vendors");
  app.delete(vendors);
});
